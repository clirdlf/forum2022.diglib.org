import {readFile} from 'node:fs/promises';
export default async function(){
 const program=JSON.parse(await readFile('data/schedule/program.json','utf8'));
 const days=[];
 for(const session of program.sessions){let day=days.find(day=>day.date===session.date);if(!day){day={date:session.date,label:session.day,sessions:[]};days.push(day);}day.sessions.push(session);}
 return {...program,days};
}
