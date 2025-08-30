load('ext://dotenv', 'dotenv')
dotenv(fn=".env", verbose=True, showValues=False)

watch_file('.env')
secret_settings(disable_scrub = True)

include('./tilt/tools/Tiltfile')
include('./tilt/apps/provider/Tiltfile')
#include('./tilt/apps/middleman/Tiltfile')
#include('./tilt/apps/middleman-workflows/Tiltfile')
include('./tilt/apps/provider-workflows/Tiltfile')
