import Lightbox from 'yet-another-react-lightbox';

// ---------------------------------------------------------------------------------------------------------------------

export default function ImageLightbox({ index = 0, onClose, slides = [], ...others }) {
  return (
    <Lightbox
      open
      index={index}
      slides={slides}
      close={() => onClose()}
      styles={{ root: { '--yarl__color_backdrop': 'rgba(0, 0, 0, .84)' } }}
      render={
        slides?.length < 2
          ? {
              buttonPrev: () => null,
              buttonNext: () => null,
            }
          : null
      }
      {...others}
    />
  );
}
