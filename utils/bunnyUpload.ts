export async function uploadToBunnyCDN({ file, fileName, path = "" }: { file: File | Blob | ArrayBuffer | Buffer, fileName: string, path?: string }) {
    const accessKey = process.env.NEXT_PUBLIC_BUNNY_STORAGE_API_KEY;
    try {
        if (!file || !fileName || !accessKey) {
            console.log(accessKey);
            throw new Error("Missing required parameters for upload.");
        }

        const filePath = `${path ? `${path}/` : ""}${fileName}`;
        const url = `https://storage.bunnycdn.com/nextauth/${filePath}`;

        const headers = new Headers();
        headers.append("AccessKey", accessKey);

        const requestOptions = {
            method: "PUT",
            headers,
            body: file,
            // redirect: "follow",
        };

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Upload Error:", err);
        throw err;
    }
}
