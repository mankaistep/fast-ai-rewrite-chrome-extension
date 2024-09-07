import { useState } from 'react';
import { rewriteText } from '../utils/api';

const useAIRewrite = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const rewrite = async (text: string, options: any) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await rewriteText(text, options);
            setIsLoading(false);
            return result;
        } catch (err) {
            setError('Failed to rewrite text. Please try again.');
            setIsLoading(false);
            return '';
        }
    };

    return { rewrite, isLoading, error };
};

export default useAIRewrite;