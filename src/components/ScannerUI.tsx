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

interface SelectedImage {
    data: string;
    name: string;
}

interface UsageInfo {
    usageCount: number;
    isPro: boolean;
    canConvert: boolean;
}

export default function ScannerUI() {
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [isFactFind, setIsFactFind] = useState(false);
    const [quality, setQuality] = useState(60);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedPdf, setGeneratedPdf] = useState<{ blob: Blob; url: string; filename: string } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [usageInfo, setUsageInfo] = useState<UsageInfo>({ usageCount: 0, isPro: false, canConvert: true });

    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
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

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImages((prev) => [...prev, {
                        data: e.target?.result as string,
                        name: file.name
                    }]);
                };
                reader.readAsDataURL(file);
            } else {
                console.log("Unsupported file type:", file.type);
            }
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const generatePDF = async () => {
        if (images.length === 0) return;
        if (!user) return;

        // Check if user can convert
        // Check if user can convert
        if (!usageInfo.canConvert) {
            setShowUpgradeModal(true);
            return;
        }

        setIsProcessing(true);
        setGeneratedPdf(null);

        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10;
            const maxWidth = pageWidth - margin * 2;
            const maxHeight = pageHeight - margin * 2;

            for (let i = 0; i < images.length; i++) {
                if (i > 0) pdf.addPage();

                let imgData = images[i].data;
                if (isFactFind) {
                    imgData = await applyScanEffect(imgData);
                }

                const compressed = await compressImage(imgData, quality / 100);
                const img = await loadImage(compressed);

                const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                const width = img.width * scale;
                const height = img.height * scale;
                const x = (pageWidth - width) / 2;
                const y = (pageHeight - height) / 2;

                pdf.addImage(compressed, "JPEG", x, y, width, height);
            }

            const filename = `scan-${new Date().getTime()}.pdf`;
            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);

            setGeneratedPdf({ blob, url, filename });

            // Increment usage count
            const newCount = await incrementUsage(user.id);
            if (newCount !== null) {
                const newCanConvert = usageInfo.isPro || newCount < 2;
                setUsageInfo({ ...usageInfo, usageCount: newCount, canConvert: newCanConvert });
            }

            setStatusMessage({ type: 'success', text: `PDF generated (${(blob.size / 1024).toFixed(0)} KB)` });

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
                console.log("Share failed", err);
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
                    className="text-4xl font-bold tracking-tight"
                >
                    Squeezer
                </motion.h1>
                <p className="text-blue-100 opacity-80">Premium Document Scanner & Compressor</p>
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
                            ? `${remainingFree} free conversion${remainingFree === 1 ? '' : 's'} remaining`
                            : 'No free conversions left — Upgrade to Pro!'
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
                            <h3 className="text-xl font-semibold text-gray-800">Add Documents</h3>
                            <p className="text-sm text-gray-500">Tap to upload or take a photo</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" size="sm" className="rounded-xl border-blue-200" onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}>
                                <FileText className="w-4 h-4 mr-2" /> Files
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-blue-200" onClick={(e) => {
                                e.stopPropagation();
                                cameraInputRef.current?.click();
                            }}>
                                <Camera className="w-4 h-4 mr-2" /> Camera
                            </Button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        <input
                            type="file"
                            ref={cameraInputRef}
                            className="hidden"
                            capture="environment"
                            accept="image/*"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>

                    {/* Preview & Controls Area */}
                    <AnimatePresence>
                        {images.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-8 space-y-8"
                            >
                                {/* Image Grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <motion.div
                                            key={idx}
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative aspect-square rounded-2xl overflow-hidden shadow-md group"
                                        >
                                            <img src={img.data} className="w-full h-full object-cover" alt="Preview" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                    <span className="text-xs font-mono bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{quality}%</span>
                                                </div>
                                                <div className="pt-2">
                                                    <Slider
                                                        value={[quality]}
                                                        onValueChange={(val) => setQuality(val[0])}
                                                        min={10}
                                                        max={100}
                                                        step={1}
                                                        className="py-2"
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
                                        onClick={usageInfo.canConvert ? generatePDF : () => setShowUpgradeModal(true)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Optimizing..." : usageInfo.canConvert ? "Create Compressed PDF" : "Upgrade to Continue"}
                                    </Button>

                                    <Button variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => setImages([])}>
                                        <RotateCcw className="w-4 h-4 mr-2" /> Clear All
                                    </Button>
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
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-green-900">PDF Ready!</h3>
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

            <div className="text-center">
                <p className="text-xs text-white/40">Privacy First: Your files never leave your device.</p>
            </div>
            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
            />
        </div>
    );
}
