module.exports = shipit => {
  require('shipit-deploy')(shipit);
  //createDeployTasks(shipit);
  shipit.initConfig({
    default: {
      workspace: '/home/joseph/Html/smart-kungahara/dist/basic-angular',
      deploy: {
        remoteCopy: {
          copyAsDir: false
        }
      },
      keepReleases: 2,
      keepWorkspace: false,
      deleteOnRollback: false,
      shallowClone: false
    },
    staging: {
      deployTo: '/var/www/html/sks-front-end',
      ignores: [],
      key: '~/.ssh/id_rsa.pub',
      servers: 'jrukundo@105.179.10.30:2202'
    },
    production: {
      deployTo: '~/smartkungahara.rw/sks-front-deployment',
      ignores: [],
      key: '~/.ssh/id_rsa.pub',
      servers: 'fedeployer@10.10.76.198'
    }
  });
};
