import { PresentationOutline, SlideItem, ExportResult } from '../types';

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (isNaN(bigint)) {
    return { red: 0.2, green: 0.4, blue: 0.8 };
  }
  return {
    red: ((bigint >> 16) & 255) / 255,
    green: ((bigint >> 8) & 255) / 255,
    blue: (bigint & 255) / 255,
  };
}

// Generate light tint for badges
function hexToLightTintRgb(hex: string): RgbColor {
  const base = hexToRgb(hex);
  return {
    red: Math.min(1, base.red * 0.15 + 0.85),
    green: Math.min(1, base.green * 0.15 + 0.85),
    blue: Math.min(1, base.blue * 0.15 + 0.85),
  };
}

export async function createGoogleSlidesPresentation(
  accessToken: string,
  outline: PresentationOutline,
  onProgress?: (step: string) => void
): Promise<ExportResult> {
  onProgress?.('Creating empty Google Slides deck...');

  // 1. Create a new presentation
  const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: outline.title || `${outline.topic} Presentation`,
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({}));
    if (createResponse.status === 401) {
      throw new Error('Your Google authorization session has expired. Please sign in again.');
    }
    if (createResponse.status === 403) {
      throw new Error(
        'Google Slides permission denied. Please verify that Slides permissions are granted.'
      );
    }
    throw new Error(
      errorData.error?.message ||
        `Failed to create presentation in Google Slides (${createResponse.status})`
    );
  }

  const newDeck = await createResponse.json();
  const presentationId = newDeck.presentationId;
  const initialSlideId = newDeck.slides?.[0]?.objectId;

  onProgress?.('Formatting slide designs, layouts, and photo fills...');

  // 2. Prepare slides to generate (including progressive bullet builds if enabled)
  interface SlideGenerationUnit {
    slide: SlideItem;
    visibleBullets: string[];
    isProgressiveStep: boolean;
    stepIndex: number;
    stepTotal: number;
    parentIndex: number;
  }

  const generationUnits: SlideGenerationUnit[] = [];

  outline.slides.forEach((slide, sIdx) => {
    // If progressive build is requested and slide is a content bullet slide with > 1 bullets
    if (
      outline.buildBulletsAcrossSlides &&
      !slide.isTitleSlide &&
      slide.slideType !== 'quote' &&
      slide.bullets.length > 1
    ) {
      slide.bullets.forEach((_, bIdx) => {
        generationUnits.push({
          slide,
          visibleBullets: slide.bullets.slice(0, bIdx + 1),
          isProgressiveStep: true,
          stepIndex: bIdx + 1,
          stepTotal: slide.bullets.length,
          parentIndex: sIdx,
        });
      });
    } else {
      generationUnits.push({
        slide,
        visibleBullets: slide.bullets,
        isProgressiveStep: false,
        stepIndex: 1,
        stepTotal: 1,
        parentIndex: sIdx,
      });
    }
  });

  const requests: any[] = [];
  const slideObjectIds: string[] = [];
  const layoutMode = outline.layoutMode || 'background-overlay';

  generationUnits.forEach((unit, uIdx) => {
    const slide = unit.slide;
    const slideId = `slide_gen_${uIdx}_${Date.now()}`;
    slideObjectIds.push(slideId);

    // 1. Create blank slide
    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: uIdx,
        slideLayoutReference: {
          predefinedLayout: 'BLANK',
        },
      },
    });

    const isTitle = !!slide.isTitleSlide;
    const hasPhoto = !!(slide.hasImage && slide.photo?.url && layoutMode !== 'no-images');
    const isOverlayMode = isTitle || layoutMode === 'background-overlay';
    const isPhotoRight = !isTitle && layoutMode === 'photo-right' && hasPhoto;

    const accent = hexToRgb(slide.accentColor || '#3B82F6');
    const badgeBg = hexToLightTintRgb(slide.accentColor || '#3B82F6');

    // 2. Background setup
    if (hasPhoto && isOverlayMode) {
      // Set full-bleed photo background fill
      requests.push({
        updatePageProperties: {
          objectId: slideId,
          fields: 'pageBackgroundFill.stretchedPictureFill.contentUrl',
          pageProperties: {
            pageBackgroundFill: {
              stretchedPictureFill: {
                contentUrl: slide.photo!.url,
              },
            },
          },
        },
      });

      // Semi-transparent dark overlay for high contrast readability (45% - 60% opacity)
      const overlayId = `scrim_${uIdx}`;
      requests.push(
        {
          createShape: {
            objectId: overlayId,
            shapeType: 'RECTANGLE',
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: { magnitude: 720, unit: 'PT' },
                height: { magnitude: 405, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 0,
                translateY: 0,
                unit: 'PT',
              },
            },
          },
        },
        {
          updateShapeProperties: {
            objectId: overlayId,
            fields: 'shapeBackgroundFill.solidFill.color,shapeBackgroundFill.solidFill.alpha,outline.propertyState',
            shapeProperties: {
              shapeBackgroundFill: {
                solidFill: {
                  color: {
                    rgbColor: { red: 0.04, green: 0.06, blue: 0.1 },
                  },
                  alpha: 0.55, // 55% opacity dark overlay for readability
                },
              },
              outline: {
                propertyState: 'NOT_RENDERED',
              },
            },
          },
        }
      );
    }

    // Top Accent Stripe (always present for section identity)
    const accentBarId = `accent_bar_${uIdx}`;
    requests.push(
      {
        createShape: {
          objectId: accentBarId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 720, unit: 'PT' },
              height: { magnitude: 7, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 0,
              translateY: 0,
              unit: 'PT',
            },
          },
        },
      },
      {
        updateShapeProperties: {
          objectId: accentBarId,
          fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState',
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: {
                color: {
                  rgbColor: accent,
                },
              },
            },
            outline: {
              propertyState: 'NOT_RENDERED',
            },
          },
        },
      }
    );

    // 3. Section pill badge
    const badgeId = `badge_${uIdx}`;
    let badgeText = isTitle
      ? 'TITLE & OVERVIEW'
      : (slide.sectionTitle || `SECTION 0${slide.slideNumber}`).toUpperCase();

    if (unit.isProgressiveStep) {
      badgeText += ` • ${unit.stepIndex}/${unit.stepTotal}`;
    }

    requests.push(
      {
        createShape: {
          objectId: badgeId,
          shapeType: 'ROUND_RECTANGLE',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 160, unit: 'PT' },
              height: { magnitude: 22, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 48,
              translateY: 26,
              unit: 'PT',
            },
          },
        },
      },
      {
        updateShapeProperties: {
          objectId: badgeId,
          fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState',
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: {
                color: {
                  rgbColor: isOverlayMode && hasPhoto ? { red: 0.15, green: 0.18, blue: 0.25 } : badgeBg,
                },
              },
            },
            outline: {
              propertyState: 'NOT_RENDERED',
            },
          },
        },
      },
      {
        insertText: {
          objectId: badgeId,
          text: `  ${badgeText}`,
          insertionIndex: 0,
        },
      },
      {
        updateTextStyle: {
          objectId: badgeId,
          fields: 'foregroundColor,fontSize,bold,fontFamily',
          textRange: { type: 'ALL' },
          style: {
            foregroundColor: {
              opaqueColor: {
                rgbColor: isOverlayMode && hasPhoto ? { red: 1, green: 1, blue: 1 } : accent,
              },
            },
            fontSize: { magnitude: 9, unit: 'PT' },
            bold: true,
            fontFamily: 'Arial',
          },
        },
      }
    );

    // 4. Slide Title text box
    const titleBoxId = `title_box_${uIdx}`;
    const textWidth = isPhotoRight ? 360 : 624;
    const titleY = isTitle ? 65 : 56;
    const titleHeight = isTitle ? 85 : 55;

    requests.push(
      {
        createShape: {
          objectId: titleBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: textWidth, unit: 'PT' },
              height: { magnitude: titleHeight, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 48,
              translateY: titleY,
              unit: 'PT',
            },
          },
        },
      },
      {
        insertText: {
          objectId: titleBoxId,
          text: slide.title || 'Untitled Slide',
          insertionIndex: 0,
        },
      },
      {
        updateTextStyle: {
          objectId: titleBoxId,
          fields: 'foregroundColor,fontSize,bold,fontFamily',
          textRange: { type: 'ALL' },
          style: {
            foregroundColor: {
              opaqueColor: {
                rgbColor: isOverlayMode && hasPhoto
                  ? { red: 1, green: 1, blue: 1 } // Crisp white on dark overlay
                  : { red: 0.08, green: 0.12, blue: 0.18 }, // Dark slate
              },
            },
            fontSize: { magnitude: isTitle ? 32 : 24, unit: 'PT' },
            bold: true,
            fontFamily: 'Arial',
          },
        },
      }
    );

    // 5. Body Content (Bullets, Quote, or Stats)
    const bodyBoxId = `body_box_${uIdx}`;
    const bodyY = isTitle ? 155 : 120;
    const bodyHeight = isTitle ? 200 : 235;

    let bodyText = '';
    const isQuoteSlide = !isTitle && slide.slideType === 'quote';

    if (isTitle && slide.subtitle) {
      bodyText = `${slide.subtitle}\n\nKey Focus Areas:\n` + unit.visibleBullets.join('\n');
    } else if (isQuoteSlide) {
      bodyText = `“${slide.title}”\n\n— ${slide.quoteAuthor || 'Core Principle'}\n\n` + unit.visibleBullets.join('\n');
    } else {
      bodyText = unit.visibleBullets.join('\n');
    }

    requests.push(
      {
        createShape: {
          objectId: bodyBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: textWidth, unit: 'PT' },
              height: { magnitude: bodyHeight, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 48,
              translateY: bodyY,
              unit: 'PT',
            },
          },
        },
      },
      {
        insertText: {
          objectId: bodyBoxId,
          text: bodyText || '• Key point\n• Discussion point',
          insertionIndex: 0,
        },
      },
      {
        updateTextStyle: {
          objectId: bodyBoxId,
          fields: 'foregroundColor,fontSize,fontFamily',
          textRange: { type: 'ALL' },
          style: {
            foregroundColor: {
              opaqueColor: {
                rgbColor: isOverlayMode && hasPhoto
                  ? { red: 0.92, green: 0.94, blue: 0.98 } // Bright readable text on photo overlay
                  : { red: 0.2, green: 0.25, blue: 0.32 }, // Soft slate
              },
            },
            // Always minimum 18pt body text over photos for readability
            fontSize: { magnitude: isOverlayMode && hasPhoto ? 18 : 16, unit: 'PT' },
            fontFamily: 'Arial',
          },
        },
      }
    );

    // Apply bullet formatting to content slides
    if (!isTitle && !isQuoteSlide && unit.visibleBullets.length > 0) {
      requests.push({
        createParagraphBullets: {
          objectId: bodyBoxId,
          textRange: { type: 'ALL' },
          bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
        },
      });
    }

    // 6. Right side Photo (when Photo on right layout is chosen)
    if (isPhotoRight) {
      const imageId = `photo_img_${uIdx}`;
      requests.push({
        createImage: {
          objectId: imageId,
          url: slide.photo!.url,
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 250, unit: 'PT' },
              height: { magnitude: 260, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 430,
              translateY: 65,
              unit: 'PT',
            },
          },
        },
      });
    }

    // 7. Photographer Credit & Footer (Required by Unsplash terms)
    const footerId = `footer_${uIdx}`;
    let creditText = `Topic to Slides • ${outline.topic}`;
    if (hasPhoto && slide.photo) {
      creditText += `  |  Photo by ${slide.photo.photographer} on Unsplash`;
    }

    requests.push(
      {
        createShape: {
          objectId: footerId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 624, unit: 'PT' },
              height: { magnitude: 20, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 48,
              translateY: 375,
              unit: 'PT',
            },
          },
        },
      },
      {
        insertText: {
          objectId: footerId,
          text: creditText,
          insertionIndex: 0,
        },
      },
      {
        updateTextStyle: {
          objectId: footerId,
          fields: 'foregroundColor,fontSize,fontFamily',
          textRange: { type: 'ALL' },
          style: {
            foregroundColor: {
              opaqueColor: {
                rgbColor: isOverlayMode && hasPhoto
                  ? { red: 0.7, green: 0.75, blue: 0.82 }
                  : { red: 0.55, green: 0.6, blue: 0.68 },
              },
            },
            fontSize: { magnitude: 8.5, unit: 'PT' },
            fontFamily: 'Arial',
          },
        },
      }
    );
  });

  // Delete the initial default blank slide from Google Slides template
  if (initialSlideId) {
    requests.push({
      deleteObject: {
        objectId: initialSlideId,
      },
    });
  }

  // Execute batchUpdate for slides structure
  const batchResponse = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!batchResponse.ok) {
    const errorData = await batchResponse.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Failed to populate presentation slides (${batchResponse.status})`
    );
  }

  onProgress?.('Attaching presenter speaker notes...');

  // 3. Attach Speaker Notes to each slide
  try {
    const getPresResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (getPresResponse.ok) {
      const presData = await getPresResponse.json();
      const slidesList = presData.slides || [];
      const notesRequests: any[] = [];

      slidesList.forEach((slideObj: any, idx: number) => {
        const unit = generationUnits[idx];
        const speakerNotesObjectId =
          slideObj.slideProperties?.notesPage?.notesProperties?.speakerNotesObjectId;

        if (speakerNotesObjectId && unit?.slide?.speakerNote) {
          notesRequests.push({
            insertText: {
              objectId: speakerNotesObjectId,
              text: unit.slide.speakerNote,
              insertionIndex: 0,
            },
          });
        }
      });

      if (notesRequests.length > 0) {
        await fetch(
          `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requests: notesRequests }),
          }
        );
      }
    }
  } catch (err) {
    console.warn('Failed to insert speaker notes:', err);
  }

  onProgress?.('Presentation ready in Google Slides!');

  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    title: outline.title,
    slideCount: generationUnits.length,
    createdTime: new Date().toISOString(),
    layoutMode,
    buildBulletsApplied: outline.buildBulletsAcrossSlides,
  };
}
