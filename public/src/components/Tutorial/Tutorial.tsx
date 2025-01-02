import { useEffect } from "react";
import introJs from "intro.js";
import "intro.js/minified/introjs.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useTutorial } from "../../context/TutorialContext";

export const Tutorial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTutorialActive, endTutorial } = useTutorial();

  useEffect(() => {
    if (!isTutorialActive) return;

    const tutorial = introJs();

    if (location.pathname === "/") {
      tutorial.setOptions({
        steps: [
          {
            title: "Welcome to MovieVault",
            intro:
              "Let us show you around! Learn how to organize movie nights with friends.",
            tooltipClass: "custom-tooltip welcome-step",
          },
          {
            element: ".next-event",
            title: "Your Next Event",
            intro:
              "Here you'll see your upcoming movie night. Click here to view details!",
            position: "bottom",
            tooltipClass: "custom-tooltip",
          },
          {
            element: ".header-search",
            title: "Quick Search",
            intro:
              "You can quickly search for any movie right from the header or click the symbol to view popular movies!",
            position: "bottom",
            tooltipClass: "custom-tooltip",
          },
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: false,
        scrollToElement: true,
        scrollPadding: 50,
      });

      tutorial.oncomplete(() => {
        navigate("/search");
        setTimeout(() => {
          startSearchTutorial();
        }, 500);
      });

      tutorial.onexit(() => {
        endTutorial();
      });
    } else if (location.pathname === "/search") {
      startSearchTutorial();
    } else if (location.pathname.startsWith("/movie/")) {
      startMovieDetailsTutorial();
    } else if (location.pathname === "/events") {
      startEventsTutorial();
    } else if (location.pathname === "/create-event") {
      startCreateEventTutorial();
    }

    function startSearchTutorial() {
      const searchTutorial = introJs();
      searchTutorial.setOptions({
        steps: [
          {
            element: "input[placeholder='Search for movies...']",
            title: "Movie Search",
            intro: "Search for any movie you'd like to watch with friends.",
            position: "bottom",
            tooltipClass: "custom-tooltip",
          },
          {
            element: ".filter-section",
            title: "Filter Movies",
            intro:
              "Refine your search using genres, release years, and ratings.",
            position: "right",
            tooltipClass: "custom-tooltip",
          },
          {
            element: ".movie-grid",
            title: "Movie Results",
            intro: "Click on any movie to see more details!",
            position: "top",
            tooltipClass: "custom-tooltip",
          },
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
      });

      searchTutorial.oncomplete(() => {
        navigate("/movie/558449");
        setTimeout(() => {
          startMovieDetailsTutorial();
        }, 500);
      });

      searchTutorial.onexit(() => {
        endTutorial();
      });

      searchTutorial.start();
    }

    function startMovieDetailsTutorial() {
      const movieDetailsTutorial = introJs();
      movieDetailsTutorial.setOptions({
        steps: [
          {
            element: ".movie-info",
            title: "Movie Information",
            intro:
              "View detailed information about the movie, including synopsis, cast, and ratings.",
            position: "right",
            tooltipClass: "custom-tooltip",
          },
          {
            element: ".header-nav",
            title: "Ready to Plan?",
            intro: "Let's go to the Events page and create a movie night!",
            position: "bottom",
            tooltipClass: "custom-tooltip",
          },
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: false,
        scrollToElement: true,
        scrollPadding: 50,
      });

      movieDetailsTutorial.oncomplete(() => {
        navigate("/events");
        setTimeout(() => {
          startEventsTutorial();
        }, 500);
      });

      movieDetailsTutorial.onexit(() => {
        endTutorial();
      });

      movieDetailsTutorial.start();
    }

    function startEventsTutorial() {
      const eventsTutorial = introJs();
      eventsTutorial.setOptions({
        steps: [
          {
            element: ".create-event-btn",
            title: "Create Events",
            intro: "Click here to start organizing your movie night!",
            position: "left",
            tooltipClass: "custom-tooltip",
          },
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: false,
      });

      eventsTutorial.oncomplete(() => {
        endTutorial();
        navigate("/create-event");
        setTimeout(() => {
          startCreateEventTutorial();
        }, 1000);
      });

      eventsTutorial.onexit(() => {
        endTutorial();
      });

      eventsTutorial.start();
    }

    function startCreateEventTutorial() {
      const createEventTutorial = introJs();
      createEventTutorial.setOptions({
        steps: [
          {
            element: ".movie-selection",
            title: "Movie Selection",
            intro:
              "Search and add multiple movies that your guests can vote on.",
            position: "right",
            tooltipClass: "custom-tooltip",
            disableInteraction: true,
          },
          {
            element: ".guest-list-input",
            title: "Guest List",
            intro:
              "Add email addresses of friends you want to invite. They'll receive an invitation to join.",
            position: "left",
            tooltipClass: "custom-tooltip",
            disableInteraction: true,
          },
          {
            element: ".event-summary",
            title: "Event Summary",
            intro: "Review your event details here before creating it.",
            position: "left",
            tooltipClass: "custom-tooltip",
            disableInteraction: true,
          },
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
      });

      createEventTutorial.oncomplete(() => {
        endTutorial();
      });

      createEventTutorial.onexit(() => {
        endTutorial();
      });

      createEventTutorial.start();
    }

    if (location.pathname === "/" && isTutorialActive) {
      tutorial.start();
    }

    return () => {
      tutorial.exit(true);
      endTutorial();
    };
  }, [location.pathname, navigate, isTutorialActive, endTutorial]);

  return null;
};
