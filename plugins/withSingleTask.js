const { withAndroidManifest } = require('expo/config-plugins');

// MainActivity の launchMode を singleTask に設定し Activity 重複を防止
module.exports = function withSingleTask(config) {
  return withAndroidManifest(config, (mod) => {
    const mainApp = mod.modResults.manifest.application?.[0];
    if (!mainApp?.activity) return mod;

    for (const activity of mainApp.activity) {
      if (activity.$?.['android:name'] === '.MainActivity') {
        activity.$['android:launchMode'] = 'singleTask';
      }
    }

    return mod;
  });
};
