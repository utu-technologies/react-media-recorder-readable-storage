"use strict";var __classPrivateFieldGet=(this&&this.__classPrivateFieldGet)||function(receiver,privateMap){if(!privateMap.has(receiver)){throw new TypeError("attempted to get private field on non-instance");}
return privateMap.get(receiver);};var __classPrivateFieldSet=(this&&this.__classPrivateFieldSet)||function(receiver,privateMap,value){if(!privateMap.has(receiver)){throw new TypeError("attempted to set private field on non-instance");}
privateMap.set(receiver,value);return value;};var _head,_end,_chunkQueue,_resolveQueue,_isInProgress,_isLocked;Object.defineProperty(exports,"__esModule",{value:true});class QueueItem{constructor(value){this.value=value;}}
class Queue{constructor(){_head.set(this,void 0);_end.set(this,void 0);}
enqueue(value){const newItem=new QueueItem(value);if(__classPrivateFieldGet(this,_end)){__classPrivateFieldGet(this,_end).next=newItem;}
else{__classPrivateFieldSet(this,_head,__classPrivateFieldSet(this,_end,newItem));}}
dequeue(){const result=__classPrivateFieldGet(this,_head);__classPrivateFieldSet(this,_head,result===null||result===void 0?void 0:result.next);if(!__classPrivateFieldGet(this,_head))
__classPrivateFieldSet(this,_end,undefined);return result===null||result===void 0?void 0:result.value;}}
_head=new WeakMap(),_end=new WeakMap();function readResult(value){return{done:false,value:value};}
const DONE={done:true};class Index{constructor(){this.url=null;_chunkQueue.set(this,new Queue());_resolveQueue.set(this,new Queue());_isInProgress.set(this,false);_isLocked.set(this,false);}
setBlobProperties(blobProperties){this.blobProperties=blobProperties;}
storeChunk(chunk){__classPrivateFieldSet(this,_isInProgress,true);const nextResolve=__classPrivateFieldGet(this,_resolveQueue).dequeue();if(nextResolve){nextResolve(readResult(chunk));}
else{__classPrivateFieldGet(this,_chunkQueue).enqueue(chunk);}}
stop(){__classPrivateFieldSet(this,_isInProgress,false);}
reset(){__classPrivateFieldSet(this,_isInProgress,false);__classPrivateFieldSet(this,_chunkQueue,new Queue());__classPrivateFieldSet(this,_resolveQueue,new Queue());__classPrivateFieldSet(this,_isLocked,false);}
getUrl(){return this.url;}
getBlob(){return undefined;}
getReader(){if(__classPrivateFieldGet(this,_isLocked))
throw new Error("Index is locked.");const thisReadableStorage=this;return{read(){const nextChunk=__classPrivateFieldGet(thisReadableStorage,_chunkQueue).dequeue();if(nextChunk){return Promise.resolve(readResult(nextChunk));}
else if(!__classPrivateFieldGet(thisReadableStorage,_isInProgress)){return Promise.resolve(DONE);}
else{return new Promise(resolve=>__classPrivateFieldGet(thisReadableStorage,_resolveQueue).enqueue(resolve));}}};};}
exports.default=Index;_chunkQueue=new WeakMap(),_resolveQueue=new WeakMap(),_isInProgress=new WeakMap(),_isLocked=new WeakMap();