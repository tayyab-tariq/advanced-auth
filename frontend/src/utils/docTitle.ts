const titleMap = {
    "/": "News Feed",
    "/home": "Home",
    "/signin": "Sign In",
    "/signup": "Sign Up",
    "/profile": "User Profile",
};

  /**
   * Returns the title of a page based on its route path.
   * @param {string} path - The path of the page route.
   * @returns {string} The title of the page with the site name appended.
   */
  export const getTitleFromRoute = (path: string) => {
    if (titleMap[path]) {
      return `${titleMap[path]} | SocioPedia`;
    }
  
    const userProfileRegex = /^\/user\/(\w+)$/;
    const postRegex = /^\/(my\/)?post\/(\w+)$/;
    const communityRegex =
      /^\/community\/(\w+)(\/report|\/reported-post|\/moderator)?$/;
  
    if (userProfileRegex.test(path)) {
      return "User Profile | SocioPedia";
    } else if (postRegex.test(path)) {
      return "Post | SocioPedia";
    } else if (communityRegex.test(path)) {
      return "Community | SocioPedia";
    }
  
    return "SocioPedia";
  };