"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Camera,
    FileText,
    Trash2,
    RotateCcw,
    Download,
    Share2,
    FileSearch,
    Zap,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { applyScanEffect, compressImage, loadImage } from "@/lib/image-utils";
import { useAuth } from "@/contexts/AuthContext";
import { checkCanConvert, incrementUsage, upgradeToPro } from "@/lib/profile";
import UpgradeModal from "@/components/UpgradeModal";
import jsPDF from "jspdf";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { PDFDocument } from 'pdf-lib';
import { compressPdfAdvanced, compressPdfBasic } from "@/lib/pdf-utils";

interface SelectedFile {
    id: string;
    data: string; // Blob URL or Data URL
    name: string;
    type: 'image' | 'pdf';
    originalSize: number;
    compressedSize?: number;
}

interface UsageInfo {
    usageCount: number;
    isPro: boolean;
    canConvert: boolean;
}

export default function ScannerUI() {
    const [files, setFiles] = useState<SelectedFile[]>([]);
    const [isFactFind, setIsFactFind] = useState(false);
    const [compressionMode, setCompressionMode] = useState<'standard' | 'advanced'>('advanced');
    const [quality, setQuality] = useState(60);
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedPdf, setGeneratedPdf] = useState<{ blob: Blob; url: string; filename: string; originalSize: number; compressedSize: number; compressionMode: 'standard' | 'advanced' } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [usageInfo, setUsageInfo] = useState<UsageInfo>({ usageCount: 0, isPro: false, canConvert: true });

    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Payment Success Handling
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams?.get("payment") === "success" && user?.id) {
            // 1. Upgrade user
            upgradeToPro(user.id).then((success) => {
                if (success) {
                    // 2. Celebrate
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    setStatusMessage({ type: 'success', text: "Welcome to Pro! Your account is now unlimited. 🎉" });

                    // 3. Update local state
                    setUsageInfo(prev => ({ ...prev, isPro: true, canConvert: true }));

                    // 4. Clean URL
                    router.replace("/");
                }
            });
        }
    }, [searchParams, user?.id]);

    // Fetch usage info on mount
    useEffect(() => {
        if (user?.id) {
            checkCanConvert(user.id)
                .then((info) => {
                    setUsageInfo(info);
                })
                .catch((err) => {
                    console.error("Error checking usage:", err);
                    setUsageInfo({ usageCount: 0, isPro: false, canConvert: true });
                });
        }
    }, [user?.id]);

    const handleFiles = (incomingFiles: FileList | null) => {
        if (!incomingFiles) return;

        const limit = usageInfo.isPro ? 10 : 2; // Keep a reasonable limit for performance
        if (files.length + incomingFiles.length > limit) {
            setStatusMessage({ type: 'error', text: `Maximum ${limit} files allowed per scan.` });
            if (!usageInfo.isPro) setTimeout(() => setShowUpgradeModal(true), 1500);
            return;
        }

        Array.from(incomingFiles).forEach((file) => {
            if (file.size > 20 * 1024 * 1024) {
                setStatusMessage({ type: 'error', text: `${file.name} is too large (>20MB).` });
                return;
            }

            const url = URL.createObjectURL(file);
            const type = file.type === 'application/pdf' ? 'pdf' : 'image';

            setFiles((prev) => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                data: url,
                name: file.name,
                type: type,
                originalSize: file.size
            }]);
        });
    };

    const removeFile = (index: number) => {
        const file = files[index];
        if (file.data.startsWith('blob:')) {
            URL.revokeObjectURL(file.data);
        }
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const processFiles = async () => {
        if (files.length === 0) return;
        if (!user) return;

        setIsProcessing(true);
        setGeneratedPdf(null);

        try {
            // Real-time check to prevent cross-device limit bypass
            const freshUsage = await checkCanConvert(user.id);
            setUsageInfo(freshUsage);

            if (!freshUsage.canConvert) {
                setIsProcessing(false);
                setShowUpgradeModal(true);
                return;
            }

            // Create a target PDF that will contain everything
            const mergedPdf = await PDFDocument.create();

            for (const fileItem of files) {
                if (fileItem.type === 'image') {
                    // Process Image -> PDF Page
                    let imgData = fileItem.data;
                    if (isFactFind) {
                        imgData = await applyScanEffect(imgData);
                    }

                    const compressed = await compressImage(imgData, quality / 100);
                    const imgBytes = await fetch(compressed).then(res => res.arrayBuffer());

                    // Embed image in the new PDF page
                    const page = mergedPdf.addPage([595.28, 841.89]); // A4 in points
                    const embeddedImg = await mergedPdf.embedJpg(imgBytes);

                    const { width, height } = embeddedImg.scaleToFit(595.28 - 40, 841.89 - 40);
                    page.drawImage(embeddedImg, {
                        x: (595.28 - width) / 2,
                        y: (841.89 - height) / 2,
                        width,
                        height,
                    });
                } else {
                    // Process PDF -> Merge & potentially compress
                    const pdfBytes = await fetch(fileItem.data).then(res => res.arrayBuffer());
                    const srcDoc = await PDFDocument.load(pdfBytes);
                    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
            }

            // Final Squeeze - choose compression method based on mode
            const finalPdfBytes = await mergedPdf.save({ useObjectStreams: true });
            const squeezedBytes = compressionMode === 'advanced'
                ? await compressPdfAdvanced(finalPdfBytes.buffer as ArrayBuffer, quality)
                : await compressPdfBasic(finalPdfBytes.buffer as ArrayBuffer);

            const filename = `squeezer-${new Date().getTime()}.pdf`;
            const blob = new Blob([squeezedBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const totalOriginalSize = files.reduce((sum, f) => sum + f.originalSize, 0);
            const compressedSize = blob.size;

            setGeneratedPdf({
                blob,
                url,
                filename,
                originalSize: totalOriginalSize,
                compressedSize: compressedSize,
                compressionMode: compressionMode
            });

            // Increment usage count
            const newCount = await incrementUsage(user.id);
            if (newCount !== null) {
                const newCanConvert = usageInfo.isPro || newCount < 2;
                setUsageInfo({ ...usageInfo, usageCount: newCount, canConvert: newCanConvert });
            }

            const reduction = Math.round((1 - (compressedSize / totalOriginalSize)) * 100);
            setStatusMessage({
                type: 'success',
                text: `Squeezed by ${reduction}%! (${(compressedSize / 1024).toFixed(0)} KB)`
            });

            // Auto-download the PDF
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Failed to generate PDF. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const sharePDF = async () => {
        if (!generatedPdf) return;

        const file = new File([generatedPdf.blob], generatedPdf.filename, { type: "application/pdf" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: "Scanned Document",
                });
            } catch (err) {
                // Share failed silently
            }
        } else {
            const a = document.createElement("a");
            a.href = generatedPdf.url;
            a.download = generatedPdf.filename;
            a.click();
        }
    };

    const remainingFree = Math.max(0, 2 - usageInfo.usageCount);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 p-4">
            {/* Header Area */}
            <div className="text-center text-white space-y-2">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic"
                >
                    DocSqueezer
                </motion.h1>
                <p className="text-blue-100 opacity-80">Privacy-First PDF Scanning & Compression</p>
            </div>

            {/* Usage Badge */}
            {!usageInfo.isPro && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${remainingFree > 0
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-500/90 text-white'
                        }`}>
                        <Sparkles className="w-4 h-4" />
                        {remainingFree > 0
                            ? `${remainingFree} free squeeze${remainingFree === 1 ? '' : 's'} available this month`
                            : 'No free squeezes left — Upgrade to Pro!'
                        }
                    </div>
                </motion.div>
            )}

            <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                    {/* Upload Area */}
                    <div
                        className="p-12 border-b border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-blue-50 transition-colors group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-800">Upload</h3>
                            <p className="text-sm text-gray-500">Upload PDFs or images to compress instantly.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" size="sm" className="rounded-xl border-blue-200" onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}>
                                <Upload className="w-4 h-4 mr-2" /> Select Files
                            </Button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/*,.pdf"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>

                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-8 space-y-8"
                            >
                                {/* File Grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={file.id}
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative aspect-square rounded-2xl overflow-hidden shadow-md group border border-gray-100"
                                        >
                                            {file.type === 'pdf' ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-red-500 p-2 text-center">
                                                    <FileText className="w-8 h-8 mb-1" />
                                                    <span className="text-[10px] text-gray-600 line-clamp-2 px-1">{file.name}</span>
                                                </div>
                                            ) : (
                                                <img src={file.data} className="w-full h-full object-cover" alt="Preview" />
                                            )}
                                            <button
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Settings Card */}
                                <Card className="bg-gray-50 border-none shadow-inner">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="pt-1">
                                                <Checkbox
                                                    id="factfind"
                                                    checked={isFactFind}
                                                    onCheckedChange={(checked) => setIsFactFind(checked as boolean)}
                                                    className="w-6 h-6 rounded-lg data-[state=checked]:bg-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="factfind" className="text-sm font-bold flex items-center gap-2 cursor-pointer">
                                                    <FileSearch className="w-4 h-4 text-blue-500" />
                                                    Premium Scan Look
                                                </label>
                                                <p className="text-xs text-gray-500">Makes photos look like professional black & white scans.</p>
                                            </div>
                                        </div>

                                        {/* Compression Mode Selector */}
                                        <div className="flex items-start space-x-4">
                                            <div className="pt-1">
                                                <div className="w-6 h-6 flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-purple-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-3 w-full">
                                                <label className="text-sm font-bold flex items-center gap-2">
                                                    Compression Mode
                                                </label>

                                                {/* Radio Options */}
                                                <div className="space-y-2">
                                                    <label className="flex items-start space-x-3 cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="compressionMode"
                                                            value="advanced"
                                                            checked={compressionMode === 'advanced'}
                                                            onChange={(e) => setCompressionMode(e.target.value as 'standard' | 'advanced')}
                                                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                                Advanced (Maximum compression)
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                60-80% reduction • Text becomes images
                                                            </div>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-start space-x-3 cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="compressionMode"
                                                            value="standard"
                                                            checked={compressionMode === 'standard'}
                                                            onChange={(e) => setCompressionMode(e.target.value as 'standard' | 'advanced')}
                                                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                                Standard (Preserve text)
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                5-15% reduction • Text stays selectable
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <div className="pt-1">
                                                <div className="w-6 h-6 flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-yellow-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-bold flex items-center gap-2">
                                                        Compression Quality
                                                    </label>
                                                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent px-3 py-1">{quality}%</span>
                                                </div>
                                                <div className="pt-2">
                                                    <Slider
                                                        value={[quality]}
                                                        onValueChange={(val) => setQuality(val[0])}
                                                        min={10}
                                                        max={100}
                                                        step={1}
                                                        className="cursor-pointer"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400">Lower quality = smaller file size. Recommended: 60%.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Final Actions */}
                                <div className="flex flex-col gap-4">
                                    <Button
                                        size="lg"
                                        className={`w-full rounded-2xl h-16 text-lg font-bold shadow-xl ${usageInfo.canConvert
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                                            }`}
                                        onClick={usageInfo.canConvert ? processFiles : () => setShowUpgradeModal(true)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Squeezing..." : usageInfo.canConvert ? "Create Compressed PDF" : "Upgrade to Continue"}
                                    </Button>

                                    <button
                                        className="w-full text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1"
                                        onClick={() => {
                                            files.forEach(f => {
                                                if (f.data.startsWith('blob:')) URL.revokeObjectURL(f.data);
                                            });
                                            setFiles([]);
                                        }}
                                    >
                                        <RotateCcw className="w-3 h-3" /> Clear All
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Download Results Area */}
                    <AnimatePresence>
                        {generatedPdf && !isProcessing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 bg-green-50 border-t border-green-100 space-y-4 text-center"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg mb-4">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900 leading-tight">Great Squeeze!</h3>
                                    <div className="text-xs font-semibold text-gray-500 mt-1">
                                        {generatedPdf.compressionMode === 'advanced' ? '⚡ Advanced Mode' : '📝 Standard Mode'}
                                    </div>

                                    <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-4 py-6 border-y border-green-200/50 mt-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider text-green-600 font-bold">Original</p>
                                            <p className="text-sm font-semibold text-green-800">{formatSize(generatedPdf.originalSize)}</p>
                                        </div>
                                        <div className="space-y-1 border-x border-green-200/50 px-2">
                                            <p className="text-[10px] uppercase tracking-wider text-green-600 font-bold">New Size</p>
                                            <p className="text-sm font-bold text-green-900">{formatSize(generatedPdf.compressedSize)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider text-green-600 font-bold">Reduction</p>
                                            <p className="text-sm font-bold text-blue-600">-{Math.round((1 - (generatedPdf.compressedSize / generatedPdf.originalSize)) * 100)}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button className="flex-1 rounded-xl h-12 bg-green-600 hover:bg-green-700" onClick={() => window.open(generatedPdf.url)}>
                                        <Download className="w-4 h-4 mr-2" /> Download
                                    </Button>
                                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-green-200 text-green-700 hover:bg-green-100" onClick={sharePDF}>
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="text-center space-y-8">
                <h3 className="text-white font-black italic text-xl">DocSqueezer</h3>
                <p className="text-slate-500 text-xs tracking-widest uppercase">Privacy-First PDF & Image Engine</p>
                <p className="text-xs text-white/40">Files are processed on YOUR device. They NEVER leave your phone or laptop.</p>

                {/* Small Pro Reminder for Authenticated Users */}
                {!usageInfo.isPro && (
                    <div className="max-w-2xl mx-auto w-full text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-flex items-center gap-2 text-xs text-white/40 bg-white/5 px-4 py-2 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Go Pro for unlimited documents & premium scan filters</span>
                        </motion.div>
                    </div>
                )}
            </div>
            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </div >
    );
}
