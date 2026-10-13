export default function(config){
 config.addPassthroughCopy('src/assets');
 config.addPassthroughCopy('src/CNAME');
 config.addPassthroughCopy('src/.nojekyll');
 config.addWatchTarget('data/archive');
 config.addFilter('absoluteUrl',path=>'https://forum2022.diglib.org'+path);
 return {dir:{input:'src',output:'_site',includes:'_includes',data:'_data'},templateFormats:['njk','11ty.js'],htmlTemplateEngine:false};
}
