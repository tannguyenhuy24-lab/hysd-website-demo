"use strict";
// aos
AOS.init({
  duration: 1500,
  once: true,
});

// footer copyright year
let copyrightCurrentyear = document.querySelector(".current-year");
copyrightCurrentyear
  ? (copyrightCurrentyear.innerHTML = new Date().getFullYear())
  : null;

// sticky header
class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector("header");
    this.headerIsAlwaysSticky =
      this.getAttribute("data-sticky-type") === "always" ||
      this.getAttribute("data-sticky-type") === "reduce-logo-size";
    this.headerBounds = {};

    this.setHeaderHeight();

    window
      .matchMedia("(max-width: 990px)")
      .addEventListener("change", this.setHeaderHeight.bind(this));

    if (this.headerIsAlwaysSticky) {
      this.header.classList.add("header-sticky");
    }

    this.currentScrollTop = 0;
    this.preventReveal = false;

    this.onScrollHandler = this.onScroll.bind(this);
    window.addEventListener("scroll", this.onScrollHandler, false);

    this.createObserver();
  }

  setHeaderHeight() {
    document.documentElement.style.setProperty(
      "--header-height",
      `${this.header.offsetHeight}px`
    );
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.onScrollHandler);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add("scrolled-past-header");
      requestAnimationFrame(this.hide.bind(this));
    } else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add("scrolled-past-header");
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove("scrolled-past-header");
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add("header-hidden", "header-sticky");
  }

  reveal() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add("header-sticky", "animate");
    this.header.classList.remove("header-hidden");
  }

  reset() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.remove("header-hidden", "header-sticky", "animate");
  }
}

customElements.define("sticky-header", StickyHeader);

// Scroll up button
class ScrollTop extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector(".scroll-to-top");
  }

  connectedCallback() {
    this.onScroll();
    this.button.addEventListener("click", this.onClick.bind(this));
  }

  onScroll() {
    window.addEventListener("scroll", function () {
      const scrollToTopButton = document.querySelector(".scroll-to-top");
      const footer = document.querySelector("footer");

      const scrollThreshold = 200;
      const footerHeight = footer ? footer.offsetHeight : 0;
      const distanceFromFooter = 50;

      const scrollY = window.scrollY || window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      // Show/Hide logic
      if (scrollY > scrollThreshold) {
        scrollToTopButton.classList.add("show");
      } else {
        scrollToTopButton.classList.remove("show");
      }

      // Stop before footer logic
      if (footer) {
        const footerTop = footer.offsetTop;
        const buttonBottomRelativeToViewport =
          viewportHeight - scrollToTopButton.getBoundingClientRect().bottom;
        const distanceToFooterTop =
          documentHeight - scrollY - viewportHeight - footerHeight;

        if (distanceToFooterTop < distanceFromFooter) {
          scrollToTopButton.style.transform = "scale(0)";
          scrollToTopButton.style.bottom = `${
            footerHeight +
            distanceFromFooter -
            (viewportHeight - buttonBottomRelativeToViewport)
          }px`;
        } else {
          scrollToTopButton.style.transform = "scale(1)";
          scrollToTopButton.style.bottom = "20px";
        }
      }
    });
  }

  onClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

customElements.define("scroll-top", ScrollTop);

// Drawer Opener
class DrawerOpener extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", this.toggle.bind(this));
  }

  toggle() {
    const ref = this.getAttribute("data-drawer");
    document.querySelector(ref).classList.toggle("show");
    document.body.classList.toggle("scroll-lock");
    if (ref != ".modal-search") {
      this.showOverlay(ref);
    }
  }

  showOverlay(ref) {
    const overlaySelector = document.querySelector("#drawer-overlay");
    if (overlaySelector.classList.contains("show")) {
      overlaySelector.classList.remove("show");
      overlaySelector.removeAttribute("data-drawer");
    } else {
      overlaySelector.classList.add("show");
      overlaySelector.setAttribute("data-drawer", ref);
    }
  }
}

customElements.define("drawer-opener", DrawerOpener);

// Mobile Menu
class DrawerMenu extends HTMLElement {
  constructor() {
    super();

    this.buttons = this.querySelectorAll(".menu-accrodion");
    this.windowWidth = window.innerWidth;
  }

  connectedCallback() {
    this.action = this.buttons.forEach((button) => {
      button.addEventListener("click", this.toggle.bind(this));
    });

    window.addEventListener("resize", this.action);
  }

  toggle(event) {
    if (this.windowWidth > 991) return;

    let sibling = event.target.nextElementSibling;

    if (sibling) {
      event.preventDefault();
      event.target.classList.toggle("active");

      let hasGrandmenu = sibling.querySelector(".header-grandmenu");

      if (event.target.classList.contains("active")) {
        // expand
        if (hasGrandmenu) {
          sibling.style.maxHeight =
            sibling.scrollHeight + hasGrandmenu.scrollHeight + "px";
        } else {
          sibling.style.maxHeight = sibling.scrollHeight + "px";
        }
      } else {
        // collapse
        sibling.style.maxHeight = null;
      }
    }
  }
}

customElements.define("drawer-menu", DrawerMenu);

// Accordion
class AccordionHorizontal extends HTMLElement {
  constructor() {
    super();

    this.buttons = this.querySelectorAll(".accordion-title");
  }

  connectedCallback() {
    const mediaQuery = window.matchMedia("(min-width: 992px)");
    this.buttons.forEach((button) => {
      if (mediaQuery.matches) {
        button
          .closest(".accordion-li")
          .style.setProperty("--width", `${button.offsetWidth}px`);
        button.addEventListener("click", this.toggleWidth.bind(this));
      } else {
        button.addEventListener("click", this.toggleHeight.bind(this));
      }
    });

    this.buttons[0].click();
  }

  toggleWidth(event) {
    this.buttons.forEach((elem) =>
      elem.closest(".accordion-li").classList.remove("active")
    );
    event.target.closest(".accordion-li").classList.add("active");
  }

  toggleHeight(event) {
    this.buttons.forEach((elem) => {
      elem.closest(".accordion-li").classList.remove("active");
      elem.nextElementSibling.style.maxHeight = null;
    });

    event.target.closest(".accordion-li").classList.add("active");
    let sibling = event.target.nextElementSibling;
    sibling.style.maxHeight = sibling.scrollHeight + "px";
  }
}

customElements.define("accordion-horizontal", AccordionHorizontal);

// Hero Slider
class HeroSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.slides = this.querySelectorAll(".swiper-slide");
    this.next = this.querySelector(".swiper-button-next");
    this.prev = this.querySelector(".swiper-button-prev");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      loop: true,
      navigation: {
        nextEl: this.next,
        prevEl: this.prev,
      },
    });
  }
}

customElements.define("hero-slider", HeroSlider);

// Hero Banner Slider
class BannerSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".main-slider .swiper");
    this.swiperThumb = this.querySelector(".thumb-slider .swiper");
    this.next = this.querySelector(".swiper-button-next");
    this.prev = this.querySelector(".swiper-button-prev");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.sliderThumb = new Swiper(this.swiperThumb, {
      freeMode: true,
      watchSlidesProgress: true,
      navigation: {
        nextEl: this.next,
        prevEl: this.prev,
      },
      breakpoints: {
        0: {
          spaceBetween: 10,
          slidesPerView: 3,
        },
        575: {
          spaceBetween: 16,
          slidesPerView: 3,
        },
        768: {
          spaceBetween: 20,
          slidesPerView: 3,
        },
      },
    });

    this.slider = new Swiper(this.swiper, {
      spaceBetween: 10,
      thumbs: {
        swiper: this.sliderThumb,
      },
    });
  }
}

customElements.define("banner-slider", BannerSlider);

// New Hero Banner Slider
class NewBanner extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".main-slider .swiper");
    this.swiperThumb = this.querySelector(".thumb-slider .swiper");
    this.next = this.querySelector(".swiper-button-next");
    this.prev = this.querySelector(".swiper-button-prev");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.sliderThumb = new Swiper(this.swiperThumb, {
      watchSlidesProgress: true,
      slidesPerView: 3,
      breakpoints: {
        0: {
          spaceBetween: 16,          
        },
        575: {
          spaceBetween: 20,
        },
        768: {
          spaceBetween: 30,
        },
      },
    });

    this.slider = new Swiper(this.swiper, {
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      thumbs: {
        swiper: this.sliderThumb,
      },
    });
  }
}

customElements.define("new-banner", NewBanner);

// Project Slider
class ProjectSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.next = this.querySelector(".swiper-button-next");
    this.prev = this.querySelector(".swiper-button-prev");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      // Navigation
      navigation: {
        nextEl: this.next,
        prevEl: this.prev,
      },

      // Auto slide
      autoplay: {
        delay: 3000, // 3 giây chuyển slide
        disableOnInteraction: false,
      },

      // Lặp vô hạn
      loop: true,

      // Tốc độ chuyển slide
      speed: 800,

      // Responsive
      breakpoints: {
        0: {
          spaceBetween: 20,
          slidesPerView: 1.2,
        },

        575: {
          spaceBetween: 20,
          slidesPerView: 1.8,
        },

        768: {
          spaceBetween: 20,
          slidesPerView: 2,
        },

        992: {
          spaceBetween: 30,
          slidesPerView: 3,
        },

        1280: {
          spaceBetween: 40,
          slidesPerView: 4,
        },
      },
    });
  }
}

customElements.define("project-slider", ProjectSlider);

// Counter Up 
class CounterUp extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initObserver();
  }

  initObserver() {
    if (this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    this.observer.observe(this);
  }

  startCounters() {
    const count = this.querySelectorAll(".counter-item .heading");

    count.forEach((count) => {
      const target = parseInt(count.getAttribute("data-target"), 10);
      const speed = 100;
      let current = 0;
      const increment = target / speed;

      const update = () => {
        current += increment;
        if (current < target) {
          count.childNodes[0].textContent = Math.ceil(current);
          requestAnimationFrame(update);
        } else {
          count.childNodes[0].textContent = target;
        }
      };

      update();
    });
  }
}

customElements.define("counter-up", CounterUp);

// Team Slider
class TeamSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        0: {
          spaceBetween: 20,
          slidesPerView: 1.2,
        },
        575: {
          spaceBetween: 20,
          slidesPerView: 2,
        },
        992: {
          spaceBetween: 20,
          slidesPerView: 3,
        },
        1280: {
          spaceBetween: 30,
          slidesPerView: 4,
        },
      },
    });
  }
}

customElements.define("team-slider", TeamSlider);

// Team Slider 2
class TeamSlider2 extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.next = this.querySelector(".swiper-button-next");
    this.prev = this.querySelector(".swiper-button-prev");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      navigation: {
        nextEl: this.next,
        prevEl: this.prev,
      },
      breakpoints: {
        0: {
          spaceBetween: 16,
          slidesPerView: 1.2,
        },
        575: {
          spaceBetween: 16,
          slidesPerView: 1.5,
        },
        768: {
          spaceBetween: 0,
          slidesPerView: 1.6,
        },
        992: {
          spaceBetween: 0,
          slidesPerView: 1.8,
        },
        1279: {
          spaceBetween: 0,
          slidesPerView: 2.2,
        },
      },
    });
  }
}

customElements.define("team-slider2", TeamSlider2);

// Testimonial Slider
class TestiSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        0: {
          spaceBetween: 20,
          slidesPerView: 1,
        },
        840: {
          spaceBetween: 20,
          slidesPerView: 2,
        },
        1280: {
          spaceBetween: 30,
          slidesPerView: 2,
        },
      },
    });
  }
}

customElements.define("testi-slider", TestiSlider);

// Testimonial Slider
class TestimonialSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".main-img .swiper");
    this.swiperThumb = this.querySelector(".thumb-content .swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.sliderThumb = new Swiper(this.swiperThumb);

    this.slider = new Swiper(this.swiper, {
      // effect: "fade",
      // fadeEffect: {
      //   crossFade: true,
      // },
      pagination: {
        el: this.pagination,
        clickable: true,
        renderBullet: function (index, className) {
          return `
            <div class="${className} custom-bullet">
              <img src="assets/img/testimonial/t${index + 1}sm.jpg" />
            </div>`;
        },
      },
      thumbs: {
        swiper: this.sliderThumb,
      },
    });
  }
}

customElements.define("testimonial-slider", TestimonialSlider);

// FAQ Accordion
class FaqAccordion extends HTMLElement {
  constructor() {
    super();
    this.opener = this.querySelectorAll(".accordion-opener");
  }

  connectedCallback() {
    this.opener.forEach((opener) => {
      opener.addEventListener("click", this.toggleHeight.bind(this));
    });

    this.firstBlock = this.querySelector(".accordion-block");
    if (this.firstBlock) {
      this.firstContent = this.firstBlock.querySelector(".accordion-content");
      this.firstBlock.classList.add("active");
      this.firstContent.style.maxHeight = this.firstContent.scrollHeight + "px";
    }
  }

  toggleHeight(event) {
    this.accBlock = event.target.closest(".accordion-block");
    this.accContent = this.accBlock.querySelector(".accordion-content");

    this.querySelectorAll(".accordion-block").forEach((block) => {
      this.content = block.querySelector(".accordion-content");

      if (block !== this.accBlock) {
        block.classList.remove("active");
        this.content.style.maxHeight = null;
      }
    });

    this.accBlock.classList.toggle("active");

    if (this.accBlock.classList.contains("active")) {
      this.accContent.style.maxHeight = this.accContent.scrollHeight + "px";
    } else {
      this.accContent.style.maxHeight = null;
    }
  }
}

customElements.define("faq-accordion", FaqAccordion);

// Progress Bar
class ProgressBar extends HTMLElement {
  constructor() {
    super();

    this.items = [];
    this.observer = null;
    this.hasAnimated = false;
  }

  connectedCallback() {
    this.items = Array.from(this.querySelectorAll(".progress-item"));
    this.initObserver();
  }

  initObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.startAll();
            this.hasAnimated = true;
            this.observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    this.observer.observe(this);
  }

  startAll() {
    this.items.forEach((item) => {
      this.animateItem(item);
    });
  }

  animateItem(item, duration = 2000) {
    const bar = item.querySelector(".progress--bar");
    const number = item.querySelector(".progress-number");
    const container = item.querySelector(".progress-container");

    if (container) container.style.position = "relative";

    const target = parseInt(item.dataset.progress, 10) || 0;
    if (target === 0) return;

    let current = 0;
    const stepTime = duration / target;

    number.style.position = "absolute";
    number.style.top = "-30px";

    function update() {
      current++;
      const width = `${current}%`;
      bar.style.width = width;
      number.textContent = `${current}%`;
      number.style.left = `calc(${current}% - ${number.offsetWidth / 2}px)`;

      if (current < target) {
        setTimeout(update, stepTime);
      }
    }

    update();
  }
}

customElements.define("progress-bar", ProgressBar);

// Service Slider
class ServiceSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        0: {
          spaceBetween: 20,
          slidesPerView: 1,
        },
        575: {
          spaceBetween: 20,
          slidesPerView: 1.2,
        },
        768: {
          spaceBetween: 20,
          slidesPerView: 1.8,
        },
        992: {
          spaceBetween: 20,
          slidesPerView: 2,
        },
        1200: {
          spaceBetween: 20,
          slidesPerView: 2.4,
        },
      },
    });
  }
}

customElements.define("service-slider", ServiceSlider);

// Expert Slider
class ExpertSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.next = this.querySelector(".swiper-button-next");
    this.prev = this.querySelector(".swiper-button-prev");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
       navigation: {
        nextEl: this.next,
        prevEl: this.prev,
      },
      breakpoints: {
        0: {
          spaceBetween: 0,
          slidesPerView: 1,
        },
        575: {
          spaceBetween: 0,
          slidesPerView: 1.2,
        },
        768: {
          spaceBetween: 0,
          slidesPerView: 1.2,
        },
        992: {
          spaceBetween: 0,
          slidesPerView: 1.4,
        },
      },
    });
  }
}

customElements.define("expert-slider", ExpertSlider);

// Video Modal
class ModalVideo extends HTMLElement {
  constructor() {
    super();
    this.playBtn = this.querySelector(".open-video");
    this.modal = this.querySelector(".video-modal");
    this.videoFrame = this.querySelector(".video-frame");
    this.closeBtn = this.querySelector(".close");
  }

  connectedCallback() {
    // Open modal
    this.playBtn.addEventListener("click", () => this.open());

    // Close modal
    this.closeBtn.addEventListener("click", () => this.close());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open() {
    this.modal.classList.add("active");
    document.body.classList.add('no-scroll');
    this.videoFrame.play();
  }

  close() {
    this.modal.classList.remove("active");
     document.body.classList.remove('no-scroll');
    this.videoFrame.pause();
    this.videoFrame.currentTime = 0;
  }
}

customElements.define("modal-video", ModalVideo);

// Testimonial Slider
class TestiColumnSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      spaceBetween: 20,
      slidesPerView: 1,
      pagination: {
        el: this.pagination,
        clickable: true,
      },
    });
  }
}

customElements.define("testicolumn-slider", TestiColumnSlider);

// Team Slider
class RecentProject extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector(".swiper");
    this.pagination = this.querySelector(".swiper-pagination");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.slider = new Swiper(this.swiper, {
      pagination: {
        el: this.pagination,
        clickable: true,
      },
      breakpoints: {
        0: {
          spaceBetween: 16,
          slidesPerView: 1,
        },
        575: {
          spaceBetween: 16,
          slidesPerView: 1.3,
        },
        992: {
          spaceBetween: 20,
          slidesPerView: 1.5,
        },
        1280: {
          spaceBetween: 30,
          slidesPerView: 1.8,
        },
      },
    });
  }
}

customElements.define("recent-project", RecentProject);
// Change image product
// let currentImageIndex = -1;

// function changeImageProduct() {
//   const mainImage = document.getElementById("img-ourProduct-main");
//   const h2OurProducts = document.getElementById("h2-our-products");
//   const textDetailProduct = document.getElementById("text-detail-product");
//   if (!mainImage) {
//     return;
//   }

//   const images = [
//     document.getElementById("img-ourProduct-1"),
//     document.getElementById("img-ourProduct-2"),
//     document.getElementById("img-ourProduct-3"),
//     document.getElementById("img-ourProduct-4")
//   ];

//   if (images.some(image => !image)) {
//     return;
//   }

//   // Lưu src gốc của mainImage
//   if (!mainImage.dataset.originalSrc) {
//     mainImage.dataset.originalSrc = mainImage.src;
//   }

//   currentImageIndex++;

//   if (currentImageIndex >= images.length) {
//     currentImageIndex = -1;
//   }

//   if (currentImageIndex === -1) {
//     mainImage.src = mainImage.dataset.originalSrc;
//   } else {
//     mainImage.src = images[currentImageIndex].src;
//   }
// } 
function changeImageProduct() {
  const mainImage = document.getElementById("img-ourProduct-main");
  const h2OurProducts = document.getElementById("h2-our-products");
  const textDetailProduct = document.getElementById("text-detail-product");

  // Không phải trang Product thì không làm gì
  if (!mainImage || !h2OurProducts || !textDetailProduct) {
    return;
  }

  const images = [
    document.getElementById("img-ourProduct-1"),
    document.getElementById("img-ourProduct-2"),
    document.getElementById("img-ourProduct-3"),
    document.getElementById("img-ourProduct-4")
  ];

  if (images.some(image => !image)) {
    return;
  }

  // Nội dung tương ứng với từng ảnh
  const productDetails = [
    {
      title: "3D Embossed Nonwoven",
      detail: "Enhanced surface design, softness and visual differentiation."
    },
    {
      title: "Perforated Nonwoven",
      detail: "Engineered for improved liquid transfer and functional performance."
    },
    {
      title: "Acquisition Distribution Layer (ADL)",
      detail: "Designed for rapid acquisition and effective liquid distribution."
    },
    {
      title: "Multi-Layer Nonwoven",
      detail: "Customized structures combining different fibers and performance functions."
    }
  ];

  // Lưu ảnh gốc của mainImage
  if (!mainImage.dataset.originalSrc) {
    mainImage.dataset.originalSrc = mainImage.src;
    mainImage.dataset.imageIndex = "-1";
  }

  let index = Number(mainImage.dataset.imageIndex);

  index++;

  if (index >= images.length) {
    index = -1;
  }

  mainImage.dataset.imageIndex = index;

  // Hiển thị ảnh
  if (index === -1) {
    mainImage.src = mainImage.dataset.originalSrc;
  } else {
    mainImage.src = images[index].src;
  }

  // Thay đổi nội dung
  if (index === -1) {
    h2OurProducts.textContent = "Air-Through Bonded Nonwoven";
    textDetailProduct.textContent = "Soft and bulky nonwoven for hygiene applications.";
  } else {
    h2OurProducts.textContent = productDetails[index].title;
    textDetailProduct.textContent = productDetails[index].detail;
  }
}
// Map customer
document.addEventListener("DOMContentLoaded", function () {

    const mapContainer = document.getElementById("customer-map");
    const status = document.getElementById("map-status");

    if (!mapContainer) return;

    const width = 1200;
    const height = 630;

    const svg = d3.select("#customer-map")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3.geoNaturalEarth1()
        .scale(195)
        .translate([width / 2, height / 2 + 20]);

    const path = d3.geoPath()
        .projection(projection);

    const mapLayer = svg.append("g");
    const connectionLayer = svg.append("g");
    const markerLayer = svg.append("g");

    const countryColors = {
        "392": "japan",
        "410": "korea",
        "840": "usa",
        "156": "china",
        "356": "india",
        "076": "brazil",
        "704": "vietnam"
    };

    /*
     * Customer / production locations.
     * Coordinates are [longitude, latitude].
     */
    const locations = {
        usa: [-77.04, 38.90],
        brazil: [-47.93, -15.78],
        india: [78.96, 20.59],
        china: [116.40, 39.90],
        japan: [139.69, 35.68],
        korea: [126.98, 37.56],
        vietnam: [108.27, 16.05]
    };

    /*
     * Connections shown on the map.
     */
    // All routes start from Vietnam and travel to the other countries.
    const connections = [
        { from: locations.vietnam, to: locations.china },
        { from: locations.vietnam, to: locations.japan },
        { from: locations.vietnam, to: locations.korea },
        { from: locations.vietnam, to: locations.india },
        { from: locations.vietnam, to: locations.usa },
        { from: locations.vietnam, to: locations.brazil }
    ];

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(function (world) {

            const countries = topojson.feature(
                world,
                world.objects.countries
            );

            mapLayer
                .selectAll(".country")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    const countryId = String(d.id);
                    return countryColors[countryId]
                        ? `country ${countryColors[countryId]}`
                        : "country";
                })
                .attr("d", path);

            connections.forEach(function (connection, index) {
                drawConnection(connection, index);
            });

            /*
             * Add location markers after the map has loaded.
             */
            // Highlight Vietnam as the main origin point.
            const vietnamPoint = projection(locations.vietnam);

            markerLayer
                .append("circle")
                .attr("cx", vietnamPoint[0])
                .attr("cy", vietnamPoint[1])
                .attr("r", 10)
                .attr("fill", "none")
                .attr("stroke", "#18b5cc")
                .attr("stroke-width", 2)
                .attr("opacity", 0.9)
                .attr("class", "vietnam-pulse");

            function pulseVietnam() {
                markerLayer
                    .select(".vietnam-pulse")
                    .attr("r", 7)
                    .attr("opacity", 1)
                    .transition()
                    .duration(1200)
                    .attr("r", 22)
                    .attr("opacity", 0)
                    .on("end", pulseVietnam);
            }

            pulseVietnam();

            Object.entries(locations).forEach(function ([name, coordinates]) {

                const point = projection(coordinates);

                const colorClass = countryColors[
                    {
                        usa: "840",
                        brazil: "076",
                        india: "356",
                        china: "156",
                        japan: "392",
                        korea: "410",
                        vietnam: "704"
                    }[name]
                ];

                const colorMap = {
                    usa: "#4356b8",
                    brazil: "#ff9800",
                    india: "#f6d91f",
                    china: "#43b95c",
                    japan: "#ef4444",
                    korea: "#e91e63",
                    vietnam: "#18b5cc"
                };

                markerLayer
                    .append("circle")
                    .attr("class", "location-dot")
                    .attr("cx", point[0])
                    .attr("cy", point[1])
                    .attr("r", 5)
                    .attr("fill", colorMap[name]);
            });
        })
        .catch(function (error) {
            console.error(error);
        });


    function drawConnection(connection, index) {

        const start = projection(connection.from);
        const end = projection(connection.to);

        const middleX = (start[0] + end[0]) / 2;
        const middleY = (start[1] + end[1]) / 2;

        const dx = end[0] - start[0];
        const dy = end[1] - start[1];

        const distance = Math.sqrt(dx * dx + dy * dy);

        const curveHeight = Math.min(
            180,
            Math.max(45, distance * 0.25)
        );

        const controlPoint = [
            middleX,
            middleY - curveHeight
        ];

        const pathData = `
            M ${start[0]} ${start[1]}
            Q ${controlPoint[0]} ${controlPoint[1]}
              ${end[0]} ${end[1]}
        `;

        const connectionPath = connectionLayer
            .append("path")
            .attr("class", "connection-line")
            .attr("d", pathData);

        const movingDot = connectionLayer
            .append("circle")
            .attr("class", "connection-dot")
            .attr("r", 4);

        animateDot(
            connectionPath,
            movingDot,
            index
        );
    }


    function animateDot(connectionPath, movingDot, index) {

        const pathNode = connectionPath.node();

        if (!pathNode) return;

        const totalLength = pathNode.getTotalLength();

        function move() {

            movingDot
                .transition()
                .delay(index * 250)
                .duration(2600 + index * 250)
                .ease(d3.easeLinear)
                .attrTween("transform", function () {

                    return function (t) {

                        const point =
                            pathNode.getPointAtLength(
                                t * totalLength
                            );

                        return `translate(${point.x}, ${point.y})`;
                    };

                })
                .on("end", function () {
                    // Return to Vietnam and repeat.
                    move();
                });
        }

        // Every route starts exactly from the Vietnam side.
        const startPoint = pathNode.getPointAtLength(0);

        movingDot.attr(
            "transform",
            `translate(${startPoint.x}, ${startPoint.y})`
        );

        move();
    }

});