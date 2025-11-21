const ROUTES_PATHS = {
  HOME: {
    DEFAULT: 'home',
  },
  DEMO: {
    DEFAULT: 'demo',
    USER: 'user',
    FORM: 'form',
  },
};

export const INTERNAL_PATHS = {
  /**
   * DEMO
   */
  DEMO_DEFAULT: `${ROUTES_PATHS.DEMO.DEFAULT}`,
  DEMO_FORM: `${ROUTES_PATHS.DEMO.FORM}`,
};

export const INTERNAL_ROUTES = {
  /**
   * DEMO
   */
  DEMO_DEFAULT: `/${INTERNAL_PATHS.DEMO_DEFAULT}`,
  DEMO_FORM: `/${INTERNAL_PATHS.DEMO_DEFAULT}/${INTERNAL_PATHS.DEMO_FORM}`,
};
