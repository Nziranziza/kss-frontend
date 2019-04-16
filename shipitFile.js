const deployPath = '/home/joseph/Documents/Deployment';
const currentPath = `${deployPath}/current`;
module.exports = shipit => {
  require('shipit-deploy')(shipit);
  //createDeployTasks(shipit);
  shipit.initConfig({
    default: {
      workspace: '/home/joseph/Html/smart-kungahara/dist/basic-angular',
      deployTo: deployPath,
      repositoryUrl: 'https://gitlab.com/bk_techouse/frontend-naeb',
      ignores: [],
      keepReleases: 2,
      branch: 'master',
      key: '~/.ssh/id_rsa.pub',
      shallowClone: false
    },
    staging: {
      servers: 'joseph@192.168.0.194:22',
      build: 'ng build --prod --aot'
    }
  });
  // Override 'fetch' step of shipit-deploy
  shipit.blTask('deploy:fetch', async () => {
    // Normally this step would've fetch project files from git
    // In this case, codeship provides those files to location defined in
    shipit.workspace = shipit.config.workspace;
    shipit.log('Established path to project files.');
  });
};
