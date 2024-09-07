export function getSelectionPosition(): { top: number; left: number; bottom: number; right: number } | null {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            bottom: rect.bottom + window.scrollY,
            right: rect.right + window.scrollX
        };
    }
    return null;
}

export function isEditableElement(element: Element | null): boolean {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        element.hasAttribute('contenteditable')
    );
}

export function getSelectedText(): string {
    return window.getSelection()?.toString() || '';
}