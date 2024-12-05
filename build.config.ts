import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    externals: [/dist\/utils\//],
    entries: [{
        input: 'src/utils/',
        outDir: 'dist/utils',
    }],
});
