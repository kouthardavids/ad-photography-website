'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { PORTFOLIO_IMAGES } from '../lib/data';

export default function Portfolio() {
    const theme = useTheme();
    const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

    const cols = 3;
    const rowHeight = isMdUp ? 280 : isSmUp ? 200 : 140;
    const gap = isMdUp ? 12 : isSmUp ? 8 : 6;

    return (
        <Box data-nav-theme="light" id="portfolio">
            <Box sx={{ position: 'relative', maxWidth: 1152, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 5, sm: 8 }, textAlign: 'center' }}>
                <p
                    className="text-3xl font-light tracking-wide sm:text-5xl"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    Portfolio
                </p>

                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: { xs: 'none', sm: 'block' },
                        pointerEvents: 'none',
                    }}
                >
                    <Box sx={{ height: '1px', bgcolor: 'grey.200', maxWidth: 1152, mx: 'auto' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1152, mx: 'auto', px: '16.6%' }}>
                        <Box sx={{ width: '1px', height: 24, bgcolor: 'grey.200' }} />
                        <Box sx={{ width: '1px', height: 24, bgcolor: 'grey.200' }} />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ maxWidth: 1152, mx: 'auto', px: { xs: 1, sm: 3 }, pb: { xs: 6, sm: 10 } }}>
                <ImageList
                    variant="quilted"
                    cols={cols}
                    gap={gap}
                    rowHeight={rowHeight}
                    sx={{
                        overflow: 'visible',
                        m: 0,
                    }}
                >
                    {PORTFOLIO_IMAGES.map((img, i) => {
                        const isHero = i % 3 === 1;
                        return (
                            <ImageListItem
                                key={img.id}
                                rows={isHero ? 2 : 1}
                                cols={1}
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="lazy"
                                    decoding="async"
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'cover',
                                        objectPosition: img.position ?? 'center',
                                        borderRadius: 12,
                                        display: 'block',
                                    }}
                                />
                            </ImageListItem>
                        );
                    })}
                </ImageList>

                {PORTFOLIO_IMAGES.length === 0 && (
                    <Typography sx={{ py: 8, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
                        No images in this category yet.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}