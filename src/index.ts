import { VideoStorage } from "react-media-recorder";

class QueueItem<ValueType> {
  readonly value: ValueType;
  next?: QueueItem<ValueType>;

  constructor(value: ValueType) {
    this.value = value;
  }
}

/**
 * Minimalistic queue with O(1) enqueue and dequeue functions.
 */
class Queue<ValueType> {
  #head?: QueueItem<ValueType>;
  #end?: QueueItem<ValueType>;

  /**
   * Enqueues given value.
   * @param value
   */
  enqueue(value: ValueType) {
    const newItem = new QueueItem(value)
    if(this.#end) {
      this.#end.next = newItem;
    } else {
      this.#head = this.#end = newItem;
    }
  }

  /**
   * Dequeues the next value if existing, otherwise returns undefined.
   */
  dequeue(): ValueType | undefined {
    const result = this.#head;
    this.#head = result?.next;
    if(!this.#head) this.#end = undefined;
    return result?.value;
  }
}


function readResult(value: Blob): ReadableStreamReadResult<Blob> {
  return {
    done: false,
    value: value
  }
}

const DONE: ReadableStreamReadResult<Blob> = { done: true };

/** A minimal reader interface which only support the read() method. Can be used e.g. with tus-js-client. */
export interface MinimalReader {
  read(): Promise<ReadableStreamReadResult<Blob>>
}

export default class ReadableStorage implements VideoStorage {
  blobProperties: any;
  url: string | null = null;

  #chunkQueue: Queue<Blob> = new Queue();
  #resolveQueue: Queue<Function> = new Queue();
  #isInProgress: boolean = true;

  #isLocked?: boolean = false;

  setBlobProperties(blobProperties: BlobPropertyBag): void {
    this.blobProperties = blobProperties;
  }

  storeChunk(chunk: Blob): void {
    this.#isInProgress = true;

    const nextResolve = this.#resolveQueue.dequeue();

    if(nextResolve) {
      nextResolve(readResult(chunk));
    } else {
      this.#chunkQueue.enqueue(chunk);
    }
  }

  stop(): void {
    this.#isInProgress = false;
  }

  reset(): void {
    this.#isInProgress = true;
    this.#chunkQueue = new Queue();
    this.#resolveQueue = new Queue();
    this.#isLocked = false;
  }

  getUrl(): string | null {
    return this.url;
  }

  getBlob(): Blob | undefined {
    return undefined;
  }

  /**
   * Gets a MinimalReader for this storage if not locked, and locks this storage. If locked, an Error is thrown.
   */
  getReader(): MinimalReader {
    if(this.#isLocked) throw new Error("ReadableStorage is locked.");

    this.#isLocked = true;

    const thisReadableStorage = this;
    return {
      read(): Promise<ReadableStreamReadResult<Blob>> {
        const nextChunk = thisReadableStorage.#chunkQueue.dequeue();

        if (nextChunk) {
          return Promise.resolve(readResult(nextChunk));
        } else if (!thisReadableStorage.#isInProgress) {
          return Promise.resolve(DONE);
        } else {
          return new Promise(resolve => thisReadableStorage.#resolveQueue.enqueue(resolve));
        }
      }
    };
  };
}

