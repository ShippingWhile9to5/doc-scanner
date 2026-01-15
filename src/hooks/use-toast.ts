export const useToast = () => {
    return {
        toast: ({ title, description }: { title: string; description?: string; variant?: string }) => {
            console.log(`TOAST: ${title} - ${description}`);
            alert(`${title}\n${description || ""}`);
        }
    };
};
