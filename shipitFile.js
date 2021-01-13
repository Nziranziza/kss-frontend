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
      key: '~/.ssh/id_rsa.pub',
      servers: 'jrukundo@105.179.10.30:2202'
    },
    production: {
      deployTo: '',
      ignores: [],
      key: '~/.ssh/id_rsa.pub',
      servers: ''
    }
  });
};
