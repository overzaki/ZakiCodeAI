import React, {CSSProperties} from 'react';
import Image, {ImageProps} from "next/image";


export interface INextSvgImageProps extends Omit<ImageProps, 'height' | 'width' | 'alt'> {
    width?: ImageProps['width'];
    height?: ImageProps['height'];
    alt?: ImageProps['alt'];
    style?: CSSProperties
}

const NextSvgImage = ({width = 0, height = 0, style, alt = '', ...restProps}: INextSvgImageProps) => {
    return (
        <>
            <Image
                width={width}
                height={height}
                alt={alt}
                style={{
                    width: '24px',
                    height: '24px',
                    ...style
                }}
                {...restProps}
            />
        </>
    );
}

export default NextSvgImage;
