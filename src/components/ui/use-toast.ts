import { toast } from "sonner"

// A biblioteca sonner não exporta um hook useToast, apenas a função toast.
// Este hook é uma abstração simples para manter a consistência.
const useToast = () => {
    return { toast };
}

export { useToast, toast };
