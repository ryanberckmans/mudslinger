/* Should run from package root, so paths accordingly */
export default {
    entry: 'ts/build/build_client/client/client.js',
    format: 'umd',
    dest: 'static/arcWebClient.js',
    moduleName: 'ArcWebClient',
    sourceMap: 'inline'
};
