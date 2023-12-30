export class SequenceGenerator {
    private sequence: string;
    private index: number;
  
    constructor(sequence: string) {
      this.sequence = sequence;
      this.index = 0;
    }
  
    next(): string {
      const value = this.sequence.charAt(this.index);
      this.index = (this.index + 1) % this.sequence.length;
      console.log("Generator value:", value);
      return value;
    }
  }
  