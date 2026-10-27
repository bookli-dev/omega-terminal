import {validate} from './model.js';
export const FOLDER='1vkqpV25vKM5imrokUGZXiixVZspxMitc';
export class Drive {
 constructor(token,fetcher=(...args)=>globalThis.fetch(...args)){this.token=token;this.fetcher=fetcher}
 async api(path,options={}){
  let r;try{r=await this.fetcher('https://www.googleapis.com/'+path,{...options,headers:{...options.headers,Authorization:'Bearer '+this.token}})}catch{throw Error('Brak połączenia lub niepewny wynik zapisu. Szkic i identyfikator ponowienia zachowano.')}
  if(!r.ok){const e=Error(r.status===401?'Sesja wygasła. Połącz ponownie.':`Błąd Drive ${r.status}. Szkic i identyfikator ponowienia zachowano. Ponów ręcznie.`);e.status=r.status;throw e}
  return r.json();
 }
 async list(q){let page='',files=[];do{const params=new URLSearchParams({q,fields:'nextPageToken,files(id,name)',pageSize:'100',...(page?{pageToken:page}:{})});const r=await this.api('drive/v3/files?'+params);files.push(...r.files);page=r.nextPageToken||''}while(page);return files}
 async read(){const files=await this.list(`'${FOLDER}' in parents and trashed=false`);const events=[];let skipped=0;for(const f of files.filter(f=>/^event-[-a-zA-Z0-9]+\.json$/.test(f.name))){try{const e=validate(await this.api('drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media'));if(f.name!=='event-'+e.id+'.json')throw Error('Nieprawidłowy identyfikator pliku');events.push(e)}catch(e){if(e instanceof SyntaxError||e.message.startsWith('Nieprawidłowy'))skipped++;else throw e}}return {events,skipped}}
 async write(e){validate(e);const name='event-'+e.id+'.json';const files=await this.list(`'${FOLDER}' in parents and trashed=false and name='${name}'`);
  for(const f of files){const existing=validate(await this.api('drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media'));if(['schema','id','taskId','at','title','text','status','report'].some(k=>existing[k]!==e[k]))throw Error('Konflikt identyfikatora zdarzenia. Nie zapisano nowego pliku.');}
  if(files.length)return;
  const boundary='omega'+crypto.randomUUID();const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify({name,parents:[FOLDER],mimeType:'application/json'})+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(e)+'\r\n--'+boundary+'--';
  await this.api('upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
 }
}
