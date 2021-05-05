import { VideoStorage } from "react-media-recorder";
/** A minimal reader interface which only support the read() method. Can be used e.g. with tus-js-client. */
export interface MinimalReader {
    read(): Promise<ReadableStreamReadResult<Blob>>;
}
export default class Index implements VideoStorage {
    #private;
    blobProperties: any;
    url: string | null;
    setBlobProperties(blobProperties: BlobPropertyBag): void;
    storeChunk(chunk: Blob): void;
    stop(): void;
    reset(): void;
    getUrl(): string | null;
    getBlob(): Blob | undefined;
    /**
     * Gets a MinimalReader for this storage if not locked, and locks this storage. If locked, an Error is thrown.
     */
    getReader(): MinimalReader;
}
