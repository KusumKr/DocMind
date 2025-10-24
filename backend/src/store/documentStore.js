// In-memory document storage
class DocumentStore {
  constructor() {
    this.documents = new Map();
  }

  set(id, document) {
    this.documents.set(id, document);
  }

  get(id) {
    return this.documents.get(id);
  }

  delete(id) {
    return this.documents.delete(id);
  }

  has(id) {
    return this.documents.has(id);
  }

  getAll() {
    return Array.from(this.documents.values());
  }

  clear() {
    this.documents.clear();
  }
}

export const documentStore = new DocumentStore();