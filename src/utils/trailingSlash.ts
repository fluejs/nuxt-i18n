export const trailingSlash = (path: string) => {
    const pathSeperated = path.split('?');
    pathSeperated[0] = pathSeperated[0].replace(/\/$/, '');
    return pathSeperated.join('?');
};
