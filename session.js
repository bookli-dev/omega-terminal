// Invalidate outstanding operations before clearing a session.
export class Session {
  generation=0;
  drive=null;
  expires=0;
  reset(){this.generation++;this.drive=null;this.expires=0;return this.generation}
  connect(drive,seconds){this.reset();this.drive=drive;this.expires=Date.now()+Math.max(0,Number(seconds)-30)*1000}
  capture(){if(!this.drive||!Number.isFinite(this.expires)||Date.now()>=this.expires)throw Error('Sesja wygasła lub nie połączono. Połącz z Google. Szkic zachowano.');return {generation:this.generation,drive:this.drive}}
  current(operation){return operation.generation===this.generation&&operation.drive===this.drive}
}
