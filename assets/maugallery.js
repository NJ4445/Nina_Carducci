(function($) {
  $.fn.mauGallery = function(options) {
    options = $.extend($.fn.mauGallery.defaults, options);
    const tagsCollection = new Set();

    this.each(function() {
      const $this = $(this);
      $.fn.mauGallery.methods.createRowWrapper($this);

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox($this, options.lightboxId, options.navigation);
      }

      $.fn.mauGallery.listeners(options);

      $this.children(".gallery-item").each(function() {
        const $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, options.columns);

        const theTag = $item.data("gallery-tag");
        if (options.showTags && theTag !== undefined) {
          tagsCollection.add(theTag);
        }
      });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($this, options.tagsPosition, Array.from(tagsCollection));
      }

      $this.fadeIn(500);
    });

    return this;
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && this.tagName === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () => $.fn.mauGallery.methods.prevImage(options.lightboxId));
    $(".gallery").on("click", ".mg-next", () => $.fn.mauGallery.methods.nextImage(options.lightboxId));
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      let columnClasses = "";

      if (typeof columns === "number") {
        columnClasses = ` col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === "object") {
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
        return;
      }

      element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      const $lightbox = $(`#${lightboxId}`);
      $lightbox.find(".lightboxImage").attr("src", element.attr("src"));
      $lightbox.modal("toggle");
    },

    navigateImage(direction) {
      const $activeImage = $("img.gallery-item").filter(function() {
        return $(this).attr("src") === $(".lightboxImage").attr("src");
      });

      const activeTag = $(".tags-bar .active-tag").data("images-toggle");
      const $imagesCollection = activeTag === "all" 
        ? $(".item-column img") 
        : $(".item-column img").filter(function() {
            return $(this).data("gallery-tag") === activeTag;
          });

      const index = $imagesCollection.index($activeImage);
      const nextIndex = (index + direction + $imagesCollection.length) % $imagesCollection.length;
      const $nextImage = $imagesCollection.eq(nextIndex);
      
      $(".lightboxImage").attr("src", $nextImage.attr("src"));
    },

    prevImage() {
      $.fn.mauGallery.methods.navigateImage(-1);
    },

    nextImage() {
      $.fn.mauGallery.methods.navigateImage(1);
    },

    createLightBox(gallery, lightboxId = "galleryLightbox", navigation) {
      gallery.append(`
        <div class="modal fade" id="${lightboxId}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : ''}
              </div>
            </div>
          </div>
        </div>
      `);
    },

    showItemTags(gallery, position, tags) {
      const tagItems = tags.reduce((acc, tag) => acc + `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`, '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>');
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      const $this = $(this);
      if ($this.hasClass("active-tag")) return;

      $(".active.active-tag").removeClass("active active-tag");
      $this.addClass("active-tag active");

      const tag = $this.data("images-toggle");
      $(".gallery-item").each(function() {
        const $parentColumn = $(this).parents(".item-column");
        $parentColumn.toggle(tag === "all" || $(this).data("gallery-tag") === tag, 300);
      });
    }
  };
})(jQuery);
