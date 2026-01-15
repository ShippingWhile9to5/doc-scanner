#!/bin/zsh
source ~/.zprofile
echo "Starting Installation..."
npm install jspdf framer-motion lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-checkbox @radix-ui/react-slider @radix-ui/react-toast @radix-ui/react-dialog @radix-ui/react-label
echo "Installation Finished. Status: $?"
cat package.json
