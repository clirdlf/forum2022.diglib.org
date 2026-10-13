import {enhanceAccessibility} from './scripts/lib/accessibility.mjs';
export default function(config){
 config.setServerOptions({port:8082});
 config.addPassthroughCopy('src/assets');
 config.addPassthroughCopy('src/CNAME');
 config.addPassthroughCopy('src/.nojekyll');
 config.addPassthroughCopy({'data/schedule/program.json':'schedule/program.json'});
 config.addWatchTarget('data/schedule');
 config.addWatchTarget('data/archive');
 config.addWatchTarget('data/content-corrections.json');
 config.addWatchTarget('scripts/lib/accessibility.mjs');
 config.addTransform('accessibility',function(content){return this.page.outputPath?.endsWith('.html')?enhanceAccessibility(content):content;});
 config.addFilter('absoluteUrl',path=>'https://forum2022.diglib.org'+path);
 return {dir:{input:'src',output:'_site',includes:'_includes',data:'_data'},templateFormats:['njk','11ty.js'],htmlTemplateEngine:false};
}
