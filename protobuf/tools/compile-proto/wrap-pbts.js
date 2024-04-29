
const fs = require('fs-extra');
const ps = require('path');

(async () => {
    const file = ps.join(__dirname, '../../../assets/scripts/gen/proto/combine.d.ts');
    const original = await fs.readFile(file, 'utf-8');
    await fs.writeFile(
        file,
        `declare global {\n export namespace pbroot{\n ${original} \n} \n} export {}`,
    );
})();
