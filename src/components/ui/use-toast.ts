import { toast } from "sonner";

// A biblioteca sonner não exporta um hook useToast, apenas a função toast.
// Este hook é uma abstração simples para manter a consistência com o ShadCN UI.
// No entanto, para evitar conflitos, exportamos diretamente a função toast da sonner.

const useToast = () => {
    return { toast };
}

export { useToast, toast };
