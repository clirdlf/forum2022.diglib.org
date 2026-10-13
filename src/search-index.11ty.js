import {load} from 'cheerio';
export default class {
 data(){return {permalink:'/search-index.json',eleventyExcludeFromCollections:true};}
 render({archive,program}){
  const entries=archive.filter(p=>p.type!=='archive').map(p=>({title:p.title,path:p.path,text:p.searchText,type:p.type}));
  for(const session of program.sessions)entries.push({title:session.title,path:'/schedule/program/#session-'+session.id,text:[session.day,session.timeAndPlace,...session.speakers,load(session.descriptionHtml).text()].join(' '),type:'session'});
  return JSON.stringify(entries);
 }
}
