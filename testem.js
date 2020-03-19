<<<<<<< HEAD
/* eslint-env node */
'use strict';

||||||| parent of 0896460... v2.17.0...v3.17.0
/* eslint-env node */
=======
'use strict';

>>>>>>> 0896460... v2.17.0...v3.17.0
module.exports = {
<<<<<<< HEAD
	framework: 'qunit',
	test_page: 'tests/index.html?hidepassed',
	disable_watching: true,
	launch_in_ci: [
		'Chrome'
	],
	launch_in_dev: [
		'Chrome'
	],
	browser_args: {
		Chrome: [
			'--headless',
			'--disable-gpu',
			'--remote-debugging-port=9222',
			'--window-size=1440,900'
		]
	}
||||||| parent of 0896460... v2.17.0...v3.17.0
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: [
    'Chrome'
  ],
  launch_in_dev: [
    'Chrome'
  ],
  browser_args: {
    Chrome: {
      mode: 'ci',
      args: [
        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ]
    }
  }
=======
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: [
    'Chrome'
  ],
  launch_in_dev: [
    'Chrome'
  ],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ].filter(Boolean)
    }
  }
>>>>>>> 0896460... v2.17.0...v3.17.0
};
