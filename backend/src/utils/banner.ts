export const displayBanner = () => {
    const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                      CREADO POR                            ║
║                                                            ║
║               JJJJJJJJJJJJJJJJJJJJJJJJ                     ║
║                          JJJ                               ║
║                          JJJ                               ║
║                          JJJ                               ║
║                          JJJ                               ║
║                          JJJ                               ║
║                    JJ    JJJ                               ║
║                    JJJ   JJJ                               ║
║                     JJJJJJJ                                ║
║                      JJJJJ                                 ║
║                                                            ║
║                UIDEportes Backend API                      ║
║                    Version 1.0.0                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`;

    console.log('\x1b[36m%s\x1b[0m', banner); // Cyan color
};
