module.exports = shipit => {
  require('shipit-deploy')(shipit);
  // createDeployTasks(shipit);
  shipit.initConfig({
    default: {
      workspace: '/home/joseph/html/smart-kungahara/dist/basic-angular',
      keepReleases: 2,
      keepWorkspace: false,
      deleteOnRollback: false,
      shallowClone: false,
      deploy: {
        remoteCopy: {
          copyAsDir: false // Should we copy as the dir (true) or the content of the dir (false)
        }
      }
    },
    staging: {
      deployTo: '/var/www/html/sks-front-end',
      ignores: [],
      key: '~/.ssh/id_ed25519.pub',
      servers: 'jrukundo@105.179.3.110:2202'
    },
    production: {
      deployTo: '~/smartkungahara.rw/sks-front-deployment',
      ignores: [],
      key: '~/.ssh/id_ed25519.pub',
      servers: 'fedeployer@10.10.76.198:22'
    }
  });
};
