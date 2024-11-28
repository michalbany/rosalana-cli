export default function useDownloadText(filename: string, content:string) {

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to the document
    document.body.appendChild(link);
    link.click();

    // Remove the element
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return;
}