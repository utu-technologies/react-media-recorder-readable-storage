import { ReadableStorage } from "./index";

/**
 * Comparing Blobs with expect().toBe[Strict]Equal doesn't work, therefore we a mock class.
 */
class BlobMock {
  size: number = 0;
  type: any;

  constructor(type: any) {
    this.type = type;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(1));
  }

  slice(start: number | undefined, end: number | undefined, contentType: string | undefined): Blob {
    return new BlobMock(1);
  }

  stream(): ReadableStream  {
    return new ReadableStream<any>();
  }

  text(): Promise<string> {
    return Promise.resolve("");
  }
}

test("store and then read the correct values", () => {
  const readableStorage = new ReadableStorage();
  const blob1 = new BlobMock(1);
  readableStorage.storeChunk(blob1);
  const blob2 = new BlobMock(2);
  readableStorage.storeChunk(blob2);
  const reader = readableStorage.getReader();

  const readsP = Promise.all([ reader.read() , reader.read() ]);

  return expect(readsP).resolves.toStrictEqual([ {
    done: false,
    value: blob1
  }, {
    done: false,
    value: blob2
  } ]);
});

test("read before store", () => {
  const readableStorage = new ReadableStorage();
  const blob = new BlobMock(1);
  const reader = readableStorage.getReader();

  const readP = reader.read();
  readableStorage.storeChunk(blob);

  return expect(readP).resolves.toStrictEqual({
    done: false,
    value: blob
  });
});

test("done after last read", () => {
  const readableStorage = new ReadableStorage();
  const blob = new BlobMock(1);
  readableStorage.storeChunk(blob);
  readableStorage.stop();

  const reader = readableStorage.getReader();
  return reader.read().then(() => expect(reader.read()).resolves.toStrictEqual({done: true}));
});

test("store and read after reset", () => {
  const readableStorage = new ReadableStorage();
  readableStorage.storeChunk(new BlobMock(1));
  readableStorage.getReader().read();
  readableStorage.stop();

  readableStorage.reset();

  const blob = new BlobMock(2);
  readableStorage.storeChunk(blob);
  readableStorage.stop();
  const reader = readableStorage.getReader();

  return expect(reader.read()).resolves.toStrictEqual({
    done: false,
    value: blob
  });
});

test("only one reader", () => {
  const readableStorage = new ReadableStorage();
  const reader = readableStorage.getReader();
  expect(() => readableStorage.getReader()).toThrow();
});
