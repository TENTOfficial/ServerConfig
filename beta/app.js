var appVersion = "1.0.5b"
var betaTest = true
var app = angular.module('modernwallet', [])
var miningProcess = require('child_process')
var StackTrace = require('stacktrace-js')
var autoLaunch = require('auto-launch');
var exec = require('child_process').exec
var fs = require('fs')
var fsextra = require('fs-extra')
var electron = require('electron')
var remote = require('electron').remote
var QRCode = require('qrcode')
var request = require('request')
var http = require('http')
var https = require('https')
var md5File = require('md5-file')
var shell = require('electron').shell;
var DecompressZip = require('decompress-zip')
var publicIp = require('public-ip')
var path = require('path')
//telegram
var TelegramBot = require('node-telegram-bot-api');
//discord
var Discord = require('discord.js');
var isDevMode = process.execPath.match(/[\\/]electron/)
var dialog = electron.remote.dialog
var isInit = true
var isSynced = false
var Steps = {"GET_COIN_LIST": -2, "PREPARE": -1, "START":0, "GET_DATA": 1, "CHECK_WALLET_VERSION": 2, "DOWNLOAD_WALLET_VERSION": 3, "CHECK_PARAMS":4, "DOWNLOAD_PARAMS":5, "CHECK_BLOCKCHAIN": 6, "DOWNLOAD_BLOCKCHAIN": 7, "CHECK_DAEMON":9, "DOWNLOAD_DAEMON": 10, "START_DAEMON": 11, "OPENING_WALLET": 12, "FINISH": 13, "CHECK_DATA_FOLDER": 14, "SHOW_POPUP": 15, "CHECK_JS": 16, "END": 17}
var CheckType = {"SERVER":0, "DAEMON": 1}
var child
var childDaemon
var GetAllDataType = {"ALL":0, "WITH_BALANCE":1, "WITH_TRANSACTIONS":2, "NONE":3}
var ScreenType = {"LOADING":0, "OVERVIEW": 1, "SEND":2, "SHIELD":3, "ADDRESSES": 4, "TRANSACTIONS": 5, "MASTERNODES": 6, "MASTERNODES_CONFIG": 7, "APPS": 8, "EXCHANGES": 9, "SETTINGS": 10, 'MASTERNODES_MAP': 11}
var MsgType = {"ALERT": 0, "CONFIRMATION": 1, "DELETE": 2, "EDITMN": 3, "UBUNTU_VERSION": 4, "DAEMON_LOCATION": 5, 'DEPENDENCIES': 6, 'DEFAULT_SETTINGS': 7, "ADD_PEERS": 8, "DEBUG": 9, "GET_PEERS": 10, "SELECTCOIN": 11, "AUTO_DOWNLOAD_DAEMON": 12, "AUTO_DOWNLOAD_BLOCKCHAIN": 13, "LOADING_RESTART_WALLET": 14, "LOADING_DAEMON": 15, "CUSTOM_DATA": 16, "DATA_LOCATION": 17, "CONFIRMATION2": 18, "MASTERNODE_OPTION": 19}
var SendType = {"NORMAL":0, "SHIELD": 1}
var allData
var helpData
var getinfoData
var z_sendmanyData
var z_getoperationstatusData
var z_shieldcoinbaseData
var validateaddressData
var masternodelistData
var masternodeoutputsData
var masternodegenkeyData
var importprivkeyData
var dumpprivkeyData
var startmasternodeData
var getPeerInfoData
var getDebugData
var getNewAddressData
var apiStatus = {}
var book = {}
var walletDic
var listtransactions
var listtransactionstime
var shouldGetTransaction = false
var shouldGetWallet = false
var shouldGetAll = true
var sendingCoin
var w;
var localMNs = []
var isRestarting = false
var startaliasData
var ipc = electron.ipcRenderer
var settings = undefined
var currentCoin
var coinList = {}
var autoLauncher
var progName
var explorer = "https://explorer.snowgem.org/"
var args = remote.process.argv
var serverData = undefined
var confData = undefined
var lastBlock
var lastBalance
var lastTotalBalance
var bot
var balance
var priceandsymbol
var transactions
var addrBook
var isBotCmd
args.splice(0,1)
if(args[0] == '.')
{
  args.splice(0,1)
}
// args = ['-testnet']
// {
//   var execPath = process.execPath.replace(/\\/g, "/")
//   var split = execPath.split('/')
//   var currLoc = execPath.split('/' + split[split.length - 1])[0]
//   var split = execPath.split('/')
//   progName = split[split.length - 1].split(' ')[0]
//   if(process.platform == 'win32')
//   {
//       autoLauncher = new autoLaunch({
//           name: 'ModernWallet',
//           path: currLoc.replace('/', /\\/g) + "\\" + "ModernWallet.exe",
//       });
//   }
//   else if(process.platform == 'linux')
//   {
//       autoLauncher = new autoLaunch({
//           name: 'ModernWallet',
//           path: currLoc + "/" + "ModernWallet",
//       });
//   }
//   else if(process.platform == 'darwin')
//   {
//       autoLauncher = new autoLaunch({
//           name: 'ModernWallet',
//           path: currLoc + "/" + "ModernWallet.app",
//       });
//   }
// }

window.$ = window.jQuery = require("../../global/vendor/jquery/jquery.js");
window.Chartist =  require("../../global/vendor/chartist/chartist.js");


//open links externally by default
$(document).on('click', 'a[href^="https"]', function(event) {
  event.preventDefault();
  shell.openExternal(this.href);
});

function handleFunction(data)
{
  // writeLog('handleFunction')
  ipc.send('main-update-data', data)
}

function handleFunctionZcash(data)
{
  // writeLog('handleFunction zcash')
  if(data.key == 'getinfo')
  {
    ipc.send('main-get-data-zcash', data)
  }
  else if(data.key == 'getwalletinfo')
  {
    ipc.send('main-get-data-zcash', data)
  }
  else if(data.key == 'z_gettotalbalance')
  {
    ipc.send('main-get-data-zcash', data)
  }
  else if(data.key == 'getblockchaininfo')
  {
    ipc.send('main-get-blockchain-info-zcash', data)
  }
  else if(data.key == 'getblockheader')
  {
    ipc.send('main-get-block-header-zcash', data)
  }
  else if(data.key == 'listtransactions')
  {
    ipc.send('main-list-transactions-zcash', data)
  }
  else if(data.key == 'getaddressesbyaccount')
  {
    ipc.send('main-get-address-by-account-zcash', data)
  }
  else if(data.key == 'listaddressgroupings')
  {
    ipc.send('main-list-address-groupings-zcash', data)
  }
  else if(data.key == 'z_listaddresses')
  {
    ipc.send('main-z-list-address-zcash', data)
  }
  else if(data.key == 'validateaddress')
  {
    ipc.send('main-validate-address-zcash', data)
  }
  else if(data.key == 'z_validateaddress')
  {
    ipc.send('main-z-validate-address-zcash', data)
  }
  else if(data.key == 'z_getbalance')
  {
    ipc.send('main-z-get-balance-zcash', data)
  }
  else if(data.key == 'listreceivedbyaddress')
  {
    ipc.send('main-list-received-by-address-zcash', data)
  }
  else
  {
    writeLog("zcash not supported")
  }
}

function spawnErr(input)
{
  //@TODO comment to test
  if(isDevMode || betaTest)
  {
    if(!input.includes("Cannot obtain a lock"))
    {
      Error.stackTraceLimit = 10

      // var line
      var callback = function(stackframes) {
        var stringifiedStack = stackframes.map(function(sf) {
          return sf.toString();
        }).join('\n');

        var data = stringifiedStack.split('\n')[1] + ": " + input

        var split = data.split('/')

        data = split[0] + ' ' + split[split.length - 1]

        if (process.env.NODE_ENV == 'production') {
          var arg = [input]
          ipc.send('main-spawn-error', arg)
        } else {
          var arg = [data]
          ipc.send('main-spawn-error', arg)
        }
      }
    }

    var errback = function(err) { console.log(err.message); };

    var error = new Error(input);

    StackTrace.fromError(error).then(callback).catch(errback);
  }
  else
  {
    var arg = [input]
    ipc.send('main-spawn-error', arg)
  }
}

function spawnData(data)
{
  alert(data)
}

function getToolVersion(dir)
{
  if(!fs.existsSync(dir))
  {
    fs.mkdirSync(dir);
    return null;
  }
  else
  {
    var versionFile = dir + "/version.txt";
    if(!fs.existsSync(versionFile))
    {
      return null;
    }
    else
    {
      return fs.readFileSync(versionFile, "utf8");
    }
  }
}

function getParamsHome(serverData) {
  var dataFolder = process.env[(process.platform == 'win32') ? 'APPDATA' : 'HOME']
  if (process.platform == 'win32') {
    dataFolder += serverData.params.win32
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  } else if (process.platform == 'linux') {
    dataFolder += serverData.params.linux
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  } else if (process.platform == 'darwin'){
    dataFolder += serverData.params.darwin
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  }
  return dataFolder
}

function getHome()
{
  var dataFolder = process.env[(process.platform == 'win32') ? 'APPDATA' : 'HOME']
  return dataFolder
}

function getWalletHome(isGetConfig, coin) {
  var dataFolder = process.env[(process.platform == 'win32') ? 'APPDATA' : 'HOME']
  if (process.platform == 'win32') {
    dataFolder += "\\ModernWallet"
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  } else if (process.platform == 'linux') {
    dataFolder += "/.modernwallet"
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  } else if (process.platform == 'darwin') {
    dataFolder += "/Library/Application Support/ModernWallet"
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  }

  if(isGetConfig == true)
  {
    //do nothing
  }
  else
  {
    dataFolder += "/" + coin
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  }

  return dataFolder.replace(/\\/g, "/")
}

function getUserHome(serverData, settings) {
  var dataFolder = process.env[(process.platform == 'win32') ? 'APPDATA' : 'HOME']
  if (process.platform == 'win32') {
    dataFolder += serverData.data.win32
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  } else if (process.platform == 'linux') {
    dataFolder += serverData.data.linux
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  } else if (process.platform == 'darwin') {
    //@TODO update darwin location
    dataFolder += serverData.data.darwin
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder)
    }
  }
  var index = args.findIndex(function(e){return e == '-testnet'})
  if(index > -1)
  {
    dataFolder += serverData.testnetfolder == undefined ? "/testnet3" : serverData.testnetfolder
  }
  if(settings != undefined && settings.datafolder != undefined && settings.datafolder != dataFolder.replace(/\\/g, "/"))
  {
    if (!fs.existsSync(settings.datafolder)) {
      fs.mkdirSync(settings.datafolder)
    }
    return settings.datafolder
  }
  else
  {
    return dataFolder.replace(/\\/g, "/")
  }
}

function makeRandom(count) {
  var text = ""
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < count; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

function backgroundProcess(name, arg) {
  var loc = name.replace(/\\/g, "/")

  var temp = arg.slice()
  if(temp[0] == '-testnet')
  {
    temp.splice(0,1)
  }
  if(arg[0] == 'z_getoperationstatus')
  {
    arg.splice(2,1)
  }
  else if(arg[0] == '-testnet' && arg[1] == 'z_getoperationstatus')
  {
    arg.splice(3,1)
  }
  else if(arg[0] == 'getdebug')
  {
    arg.splice(0, 1)
  }
  else if(arg[0].includes('validateaddress'))
  {
    if(arg.length > 2)
    {
      arg.splice(2, 1)
    }
  }
  // writeLog(arg)
  // writeLog(temp)
  var rtnData = {};

  if (fs.existsSync(loc)) {
    try {
      if (process.platform == 'linux' || process.platform == 'darwin') {
        var temparg = ["+x", loc]
        miningProcess.spawnSync("chmod", temparg)
      }

      child = miningProcess.spawn(loc, arg)

      child.stdout.on('data', function(data) {
        var strOutput = String(data)
        if (strOutput.startsWith("Error"))
        {
          writeLog("stroutput error")
          spawnErr(strOutput)
        }
        else
        {
          if(rtnData['value'] == undefined)
          {
            rtnData['key'] = temp[0]
            rtnData['arg'] = temp
            rtnData['value'] = strOutput
          }
          else
          {
            rtnData['value'] += strOutput
          }
        }
      })

      child.stderr.on('data', function(data) {
        var strOutput = String(data)
        if(rtnData['value'] == undefined)
          {
            rtnData['key'] = temp[0]
            rtnData['arg'] = temp
            rtnData['value'] = strOutput
          }
          else
          {
            rtnData['value'] += strOutput
          }
      })

      child.on('close', function(code){
        return handleFunction(rtnData)
      })
      
    } catch (err) {
      setTimeout(function(){
        writeLog("cannot start snowgem-cli")
        spawnErr("Cannot start " + loc + err.toString())
      }, 0)
    }
  } else {
    writeLog("cannot find snowgem-cli")
    spawnErr("Cannot find " + loc)
  }
}

function backgroundProcessDaemon(name, arg) {
  var loc = name.replace(/\\/g, "/")
  var rtnData = {};

  writeLog(arg)

  if (fs.existsSync(loc)) {
    try {
      if (process.platform == 'linux' || process.platform == 'darwin') {
        var temparg = ["+x", loc]
        miningProcess.spawn("chmod", temparg)
      }

      //childDaemon = miningProcess.spawn(loc, arg)
      childDaemon = miningProcess.spawn(loc, arg, {
        detached: true,
        stdio: [ 'pipe', 'pipe', 'pipe' ]
      });

      childDaemon.unref();

      var dataSend = {}
      dataSend['status'] = true
      electron.ipcRenderer.send('main-loading-screen', dataSend)

      childDaemon.stderr.pipe(process.stdout);

      childDaemon.stdout.on('data', function(data) {
        var strOutput = String(data)
        writeLog("strOutput")
        if (strOutput.startsWith("Error")) {
          writeLog("stroutput error")
          setTimeout(function(){
            spawnErr(strOutput)
          }, 0)
        }
      })

      childDaemon.stderr.on('data', function(data) {
        var strOutput = String(data)
        setTimeout(function(){

            //stop wallet
            if(!strOutput.includes('Cannot obtain a lock on data directory'))
            {
              writeLog(strOutput)
              spawnErr(strOutput)
            }
            // else
            // {
            //   dataSend['status'] = true
            //   electron.ipcRenderer.send('main-loading-screen', dataSend)
            // }
        }, 0)
      })

      childDaemon.stdin.on('error', function(code) {
        var strOutput = String(code)

        setTimeout(function(){
          writeLog("cannot start daemon 1")
          spawnErr("Cannot start " + loc)
          //stop wallet
          // var dataSend = {}
          // dataSend['status'] = false
          // electron.ipcRenderer.send('main-loading-screen', dataSend)

        }, 0)
      })
    } catch (err) {
      setTimeout(function(){
        writeLog("cannot start daemon 2")
        spawnErr("Cannot start " + loc + "\n" + String(err))

        //stop wallet
        var dataSend = {}
        dataSend['status'] = false
        electron.ipcRenderer.send('main-loading-screen', dataSend)
      }, 0)
    }
  } else {
    writeLog("cannot find daemon 2")
    spawnErr("Cannot find " + loc)
    var dataSend = {}
    dataSend['status'] = false
    electron.ipcRenderer.send('main-loading-screen', dataSend)
  }
}

function startDeamon(arg){
  writeLog("\n\n\nSTART wallet")
  backgroundProcessDaemon(settings.daemon, arg)
}

// function startCli(arg){
//   var tempArg = []
//   var index = args.findIndex(function(e){return e == '-testnet'})
//   if(index > -1)
//   {
//     tempArg.push('-testnet')
//   }
//   tempArg = tempArg.concat(arg)
//   backgroundProcess(settings.cli, tempArg)
// }

function startCli(arg, coinType){
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var tempArg = []
  var index = args.findIndex(function(e){return e == '-testnet'})
  if(confData != undefined)
  {
    if(index > -1)
    {
      port = confData.rpcport != undefined ? confData.rpcport : serverData.testnet_rpcport
    }
    else
    {
      port = confData.rpcport != undefined ? confData.rpcport : serverData.rpcport
    }
    var methods = arg[0]
    arg.splice(0,1)

    curlData(confData.rpcuser, confData.rpcpassword, port, methods, arg, coinType)
  }
}

function getFunctionName(stack){
  
  var split = stack.split('\n')
  split = split[2].split('at ')
  split = split[1].split(' (')
  return split[0]
}
function writeLog(input) {
  if(isDevMode || betaTest)
  {
    Error.stackTraceLimit = 10

    // var line
    var callback = function(stackframes) {
      var stringifiedStack = stackframes.map(function(sf) {
        return sf.toString();
      }).join('\n');

      
      try
      {
        var jsonData = JSON.stringify(input)
        var split = data.split('/')

        data = split[0] + ' ' + split[split.length - 1]
        console.log(data)
        console.log(input)
      }
      catch(ex)
      {
        var data = stringifiedStack.split('\n')[1] + ": "
        var split = data.split('/')

        data = split[0] + ' ' + split[split.length - 1]  + input
        console.log(data)
        // if (process.env.NODE_ENV == 'production') {
        //   var file = getWalletHome(false) + '/debug.log'
        //   if (fs.existsSync(file)) {
        //     var stats = fs.statSync(file)
        //     var fileSizeInBytes = stats.size
        //       //Convert the file size to megabytes (optional)
        //     var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
        //     if (fileSizeInMegabytes > 10) {
        //       fs.unlink(file, function(err) {
        //         if (err) throw err
        //         console.log('Deleted!')
        //       })
        //     }
        //   }
        //   fs.appendFile(file, data, function(err) {
        //     if (err) throw err
        //     console.log('Saved!')
        //   })
        // } else {
        //   console.log(data)
        // }
      }
    }

    var errback = function(err) { console.log(err.message); };

    var error = new Error(input);

    StackTrace.fromError(error).then(callback).catch(errback);
  }
  else
  {
    if(settings != undefined && settings.enablelog)
    {
      var file = getWalletHome(false, currentCoin) + '/debug.log'

      if (fs.existsSync(file)) {
        var stats = fs.statSync(file)
        var fileSizeInBytes = stats.size
          //Convert the file size to megabytes (optional)
        var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
        if (fileSizeInMegabytes > 10) {
          fs.unlink(file, function(err) {
            if (err) throw err
            console.log('Deleted!')
          })
        }
      }

      fs.appendFile(file, input + '\n', function(err) {
        if (err) throw err
        console.log('Saved!')
      })
    }
  }
}

function startWallet(arg) {
  var desktop = require('path').join(require('os').homedir(), 'desktop')
  desktop = '-exportdir=\"' + desktop + '\"'
  arg.push(desktop)
  writeLog(arg)
  startDeamon(arg)
}

function stopWallet() {
  var arg = ['stop']
  startCli(arg)
}

function checkWallet()
{
    var arg = [ "help" ]
    startCli(arg)
}

function getAllData(type, transacionType)
{
  var arg = [ "getalldata", type]
  if(transacionType != undefined)
  {
    arg.push(transacionType)
  }
  if(apiStatus['getalldata'] == false || apiStatus['getalldata'] == undefined)
  {
    writeLog(arg)
    apiStatus['getalldata'] = true
    startCli(arg)
  }
  else
  {
    writeLog('getting data, do not start another one')
  }
}

function getPeerInfo()
{
  var arg = [ "getpeerinfo"]
  writeLog(arg)
  startCli(arg)
}

function getNetworkHeight(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "getinfo"]
  writeLog(arg)
  startCli(arg, coinType)
}

function getBestBlockhash(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = ["getblockchaininfo"]
  writeLog(arg)
  startCli(arg, coinType)
}

function getBestTime(bloblockHashckhash, coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "getblockheader", bloblockHashckhash]
  writeLog(arg)
  startCli(arg, coinType)
}

function zGetTotalBalance(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "z_gettotalbalance"]
  writeLog(arg)
  startCli(arg, coinType)
}

function getWalletInfo( coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "getwalletinfo"]
  writeLog(arg)
  startCli(arg, coinType)
}

function getUnconfirmedBalance()
{
  var arg = [ "getunconfirmedbalance"]
  writeLog(arg)
  startCli(arg)
}

function checkConnections()
{
  var arg = [ "getconnectioncount"]
  writeLog(arg)
  startCli(arg)
}

function getAddressBalance(address, coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "z_getbalance", address]
  // writeLog(arg)
  startCli(arg, coinType)
}

function newAddress()
{
  var arg = [ "getnewaddress"]
  writeLog(arg)
  startCli(arg)
}

function newZAddress(sapling)
{
  var arg = [ "z_getnewaddress"]
  if(sapling != undefined)
  {
    arg.push("sapling")
  }
  else
  {
    arg.push("sprout")
  }
  writeLog(arg)
  startCli(arg)
}

function getDebug(request)
{
  writeLog(request)
  var arr = request.split(' ')
  arr = arr.filter(function(n){ return n != '' })
  var arg = ['getdebug']
  arg = arg.concat(arr)
  startCli(arg)
}

function exportPrivateKeys(filename)
{
  var arg = [ "z_exportwallet", filename]
  writeLog(arg)
  startCli(arg)
}

function importPrivateKeys(filename)
{
  var arg = [ "z_importwallet " + "\"" + filename + "\""]
  writeLog(arg)
  startCli(arg)
}

function exportPrivateKey(address)
{
  var arg = [ "dumpprivkey", address]
  writeLog(arg)
  startCli(arg)
}

function z_exportPrivateKey(address)
{
  var arg = [ "z_exportkey", address]
  writeLog(arg)
  startCli(arg)
}

function importPrivateKey(key, label, fRescan)
{
  var arg = [ "importprivkey", key]
  if(label != undefined)
  {
    arg.push(label)
  }
  // else
  // {
  //   arg.push("")
  // }
  // if(fRescan != undefined)
  // {
  //   arg.push(fRescan)
  // }
  writeLog(arg)
  startCli(arg)
}

function z_importPrivateKey(key, fRescan, rescanBlock)
{
  var arg = [ "z_importkey", key]
  // if(fRescan != undefined)
  // {
  //   arg.push(fRescan)
  // }
  // else
  // {
  //   arg.push(false)
  // }
  // if(rescanBlock != undefined)
  // {
  //   arg.push(rescanBlock)
  // }
  // else
  // {
  //   arg.push(0)
  // }
  writeLog(arg)
  startCli(arg)
}

function listTransactions(count, coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "listtransactions", "", count]
  writeLog(arg)
  startCli(arg, coinType)
}

function listReceivedByAddress(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "listreceivedbyaddress", 999999999, true, true]
  writeLog(arg)
  startCli(arg, coinType)
}

function getAddressByAccount(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "getaddressesbyaccount", ""]
  writeLog(arg)
  startCli(arg, coinType)
}

function listAddressGroupings(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "listaddressgroupings"]
  writeLog(arg)
  startCli(arg, coinType)
}

function zListAddress(coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  var arg = [ "z_listaddresses"]
  writeLog(arg)
  startCli(arg, coinType)
}

function sendCoin(from, to, amount, fee, defaultFee)
{
  z_sendmanyData = undefined
  z_getoperationstatusData = undefined
  var toData = []
  var temp = {}
  temp["address"] = to
  temp["amount"] = parseFloat(amount)
  toData.push(temp)
  var arg = [ "z_sendmany", from, toData, 1, parseFloat(fee)]
  writeLog(arg)
  startCli(arg)
}

function exec_sendCoin(from, to, amount, fee, type)
{
  z_sendmanyData  = undefined
  z_getoperationstatusData = undefined
  writeLog(type)
  if(type == SendType.NORMAL)
  {
    writeLog("send coin normal")
    sendCoin(from, to, amount, fee)
  }
  else if(type == SendType.SHIELD)
  {
    writeLog("shield coin")
    shieldCoin(from, to, fee)
  }
  //@TODO disable send & shield coin button

}


function sendManyCoin(from, to, fee)
{
  var sendInfo = "\"" + from + "\" " + "\"["

  to.forEach(function(item) {
    var split = item.split(',')
    sendInfo += "{\"address\":\"" + split[0] + "\",\"amount\":" + split[1] + "},"
  })
  sendInfo = sendInfo.substring(0, sendInfo.Length - 1)
  sendInfo += "]\""

  var arg = ["z_sendmany", sendInfo, "1", fee]
  writeLog(arg)
  startCli(arg)
}

function shieldCoin(from, to, fee)
{
  z_shieldcoinbaseData = undefined
  var arg = [ "z_shieldcoinbase", from, to, parseFloat(fee), 300]
  writeLog(arg)
  startCli(arg)
}

function verifyAddress(address, data, coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  validateaddressData = undefined
  var arg= ['validateaddress', address]
  arg.push(data)
  // writeLog(arg)
  startCli(arg, coinType)
}

function verifyZAddress(address, data, coinType)
{
  if(coinType == undefined)
  {
    coinType = 'snowgem'
  }
  validateaddressData = undefined
  var arg = ['z_validateaddress', address]
  arg.push(data)
  // writeLog(arg)
  startCli(arg, coinType)
}

function checkTransaction(opid, type)
{
  opid = strstd(opid)
  var temp = [opid]
  var arg = [ "z_getoperationstatus", temp]
  arg.push(type)
  // writeLog(arg)
  startCli(arg)
}

function getTransaction(txid)
{
  var arg = [ "gettransaction", txid ]
  writeLog(arg)
  startCli(arg)
}

function getMNPrivKey()
{
  masternodegenkeyData = undefined
  var arg = [ "masternode", 'genkey' ]
  writeLog(arg)
  startCli(arg)
}

function getMNOutputs()
{
  masternodeoutputsData = undefined
  var arg = [ "masternode", 'outputs' ]
  writeLog(arg)
  startCli(arg)
}

function getMasternodeList()
{
  masternodelistData = undefined
  var arg = [ "masternode", 'list' ]
  writeLog(arg)
  startCli(arg)
}

function startMasternode(name)
{
  var arg = [ "startmasternode", "alias", "false", name ]
  writeLog(arg)
  startCli(arg)
}

function startAlias(name)
{
  var arg = [ "startalias", name ]
  writeLog(arg)
  startCli(arg)
}

function startAll()
{
  var arg = [ "startmasternode", "many", "false" ]
  writeLog(arg)
  startCli(arg)
}

function readAddressBook(isGetDonation, serverData, currentCoin) {
  var addressLabel = getWalletHome(false, currentCoin) + "/addressLabel.dat";
  var oldbook = {}
  if(fs.existsSync(addressLabel))
  {
    oldbook = JSON.parse(fs.readFileSync(addressLabel, "utf8"))
  }
  if(isGetDonation)
  {
    var keys = Object.keys(oldbook)
    var index = keys.findIndex(function(e){return oldbook[e] == 'donation_address'})
    if(index == -1)
    {
      oldbook[serverData.donation_address] = 'donation_address'
    }
  }

  return oldbook
}

function addAddressBook(name, address, serverData, currentCoin) {
  book = readAddressBook(true, serverData, currentCoin)
  var values = Object.keys(book)
  var keys = Object.values(book)
  var data = {}
  if(keys.includes(name))
  {
    data['result'] = false
    data['error'] = "Duplicate name"
    return data
  }
  else if(values.includes(address))
  {
    data['result'] = false
    data['error'] = "Duplicate address"
    return data
  }
  else
  {
    var addressLabel = getWalletHome(false, currentCoin) + "/addressLabel.dat";
    book[address] = name
    delete book[serverData.donation_address]
    fs.writeFileSync(addressLabel, JSON.stringify(book))
    data['result'] = true
    data['error'] = ''
    data['book'] = book
    return data
  }
}

function editAddressBook(book, serverData, currentCoin){
  var addressLabel = getWalletHome(false, currentCoin) + "/addressLabel.dat";
  delete book[serverData.donation_address]
  fs.writeFileSync(addressLabel, JSON.stringify(book))
}

function updateWalletDic(walletDic)
{
  var newObj = JSON.parse(JSON.stringify(walletDic));
  var dicKeys = Object.keys(newObj)
  if(this.book != undefined)
  {
    var bookKeys = Object.keys(this.book)

    bookKeys.forEach(function(key){
      var index = dicKeys.findIndex(function(e){return e == key})
      if(index > -1)
      {
        var amount = newObj[key].amount
        var ismine = newObj[key].ismine
        delete newObj[key]
        var temp = {}
        temp['amount'] = amount
        temp['ismine'] = ismine
        newObj[key + ' (' + this.book[key] + ')'] = temp
      }
    })
  }

  return newObj
}

function getMasternodes()
{
  var loc = getUserHome(serverData, settings) + "/masternode.conf"
  if(fs.existsSync(loc))
  {
    return fs.readFileSync(loc, "utf8"); 
  }
  return undefined
}

function getConfig(serverData)
{
  var loc = getUserHome(serverData, settings) + "/" + serverData.conf_file
  if(fs.existsSync(loc))
  {
    return fs.readFileSync(loc, "utf8"); 
  }
  return undefined
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var year = ('0' + a.getFullYear()).slice(-4);
  var month = ('0' + (a.getMonth() + 1)).slice(-2);
  var date = ('0' + a.getDate()).slice(-2);
  var hour = ('0' + a.getHours()).slice(-2);
  var min = ('0' + a.getMinutes()).slice(-2);
  var sec = ('0' + a.getSeconds()).slice(-2);
  var time
  if((settings != undefined && settings.datetime == "1") || settings == undefined || settings.datetime == undefined)
  {
    time = year + '.' + month + '.' + date + ' '+ hour + ':' + min + ':' + sec ;
  }
  else if(settings != undefined && settings.datetime == "2")
  {
    time = date + '.' + month + '.' + year + ' '+ hour + ':' + min + ':' + sec ;
  }
  return time;
}

function secondsToString(sec)
{
    // Unix timestamp is seconds past epoch
    var day = parseInt(sec / 86400);
    var hour = parseInt((sec % 86400) / 3600);
    var min = parseInt((sec % 3600) / 60);
    if(settings == undefined)
    {
      return (day > 1 ? day + " days " : day + " day ") + ('0' + hour).slice(-2) + "h:" +('0' + min).slice(-2) + "m";
    }
    else
    {
      return (day > 1 ? day + " days " : day + " day ") + ('0' + hour).slice(-2) + "h:" +('0' + min).slice(-2) + "m";
    }
}

function currentTime(sec)
{
    // Unix timestamp is seconds past epoch
    var day = parseInt(sec / 86400);
    var hour = parseInt((sec % 86400) / 3600);
    var min = parseInt((sec % 3600) / 60);
    if(settings == undefined)
    {
      return (day > 1 ? day + " days " : day + " day ") + ('0' + hour).slice(-2) + "h:" +('0' + min).slice(-2) + "m";
    }
    else
    {
      return (day > 1 ? day + " days " : day + " day ") + ('0' + hour).slice(-2) + "h:" +('0' + min).slice(-2) + "m";
    }
}

function strstd(input)
{
  return input.replace('\r\n', '\n').replace('\n', '')
}

function bestCopyEver(src) {
  return Object.assign([], src);
}

function showTab(data, isCheck)
{
  if(isInit && isCheck)
  {
    var tabcontent = document.getElementsByClassName("tabcontent")
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"
    }
    var element = document.getElementById(getKeyByValue(ScreenType, ScreenType.LOADING))
    if(element != null)
    {
      element.style.display = "block"
    }
    $('#modalMenuBarAlert').modal()
    return
  }
  $('.modal-backdrop').remove();
  var tabcontent = document.getElementsByClassName("tabcontent")
  for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none"
  }
  writeLog(data)
  writeLog(getKeyByValue(ScreenType, data))
  var element = document.getElementById(getKeyByValue(ScreenType, data))
  if(element != null)
  {
    element.style.display = "block"
  }
  if(data == ScreenType.OVERVIEW)
  {
    ipc.send('main-update-chart', undefined)
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(function(key){return object[key] == value});
}

function editMasternode(name, ip, privkey, txhash, txid, status, oldName, isNew)
{
  if(!isNew)
  {
    var index = localMNs.findIndex(function(f){return f.alias == oldName})
    if(index > -1)
    {
      localMNs.splice(index, 1)
    }
  }
  var temp = {}
  if(status == false)
  {
    temp['status'] = "No"
  }
  else
  {
    temp['status'] = "Yes"
  }
  temp['alias'] = name
  temp['ip'] = ip
  temp['privkey'] = privkey
  temp['txhash'] = txhash
  temp['txhashidx'] = txid
  localMNs.push(temp)

  writeMasternodeFile(localMNs)
}

function removeMasternode(txhash)
{
  var index = localMNs.findIndex(function(f){return f.txhash == txhash})
  localMNs.splice(index, 1)
  writeMasternodeFile(localMNs)
}
function writeMasternodeFile(data)
{
  var dataToWrite = ""
  data.sort(function(a,b){return a.alias > b.alias})
  data.forEach(function(element){
    dataToWrite += (element.status == 'Yes' ? '' : '#') + element.alias + " " + element.ip + ":16113 " + element.privkey + " " + element.txhash + " " + element.txhashidx + "\n"
  });

  fs.writeFileSync(getUserHome(serverData, settings) + "/masternode.conf", dataToWrite)
}

function correctAliasName(name)
{
  while(name.startsWith('#'))
  {
    name.splice(0,1)
  }
  return name
}

function installDependencies(){
  var path = require('path');
  var app2 = electron.remote.app;
  var loc
  if (process.platform == 'linux')
  {
    loc = getWalletHome(true) + '/setup.sh'
  }
  else if(process.platform == 'darwin')
  {
    loc = getHome() + '/setup.command'
  }
  if(fs.existsSync(loc))
  {
    fs.unlinkSync(loc)
  }
  
  if (process.platform == 'linux')
  {
    var str = 'sudo apt-get install build-essential pkg-config libc6-dev m4 g++-multilib autoconf libtool ncurses-dev unzip git python python-zmq zlib1g-dev wget bsdmainutils automake curl'
    fs.writeFileSync(loc, str)
  }
  else if(process.platform == 'darwin')
  {
    var str = 'brew tap discoteq/discoteq; brew install flock; brew install autoconf; brew install autogen; brew install automake; brew install gcc5; brew install binutils; brew install protobuf; brew install coreutils; brew install wget'
    fs.writeFileSync(loc, str)
  }

  writeLog("run chmod setup.sh")
  var temparg = ["+x", loc]
  miningProcess.spawnSync("chmod", temparg)

  temparg = [loc]
  miningProcess.spawnSync("sh", temparg,{
    detached: true,
    shell: true
  })

  return loc
}

function saveSettings(input, coin)
{
  var keys = Object.keys(input)
  var loc = getWalletHome(false, coin) + "/settings.json"
  var data = {}
  if(fs.existsSync(loc))
  {
    try
    {
      data = JSON.parse(fs.readFileSync(loc, "utf8")) 
    }
    catch(ex){}
  }
  if(keys.length > 0)
  {
    keys.forEach(function(element){
      data[element] = input[element]
    })
  }
  fs.writeFileSync(loc, JSON.stringify(data))
  readSettings(coin)
}

function readSettings(coin)
{
  writeLog('readSettings')
  var loc = getWalletHome(false, coin) + "/settings.json"
  var data = {}
  try
  {
    data = JSON.parse(fs.readFileSync(loc, "utf8")) 
  }
  catch(ex){}
  return data
}

function getCurrentCoin(){
  var loc = getWalletHome(true, currentCoin) + "/config.json"
  var data = {}
  try
  {
    data = JSON.parse(fs.readFileSync(loc, "utf8")) 
  }
  catch(ex){}
  if(data.coinname != undefined)
  {
    return data.coinname
  }
  else
  {
    return undefined
  }
}

function saveCurrentCoin(data, coin){
  var loc = getWalletHome(true, coin) + "/config.json"
  fs.writeFileSync(loc, data)
}

var isRunning = function(jquery, cb){
  var platform = process.platform;
  var cmd = '';
  switch (platform) {
      case 'win32' : cmd = 'tasklist'; break;
      case 'darwin' : cmd = 'ps -ax'; break;
      case 'linux' : cmd = 'ps -A'; break;
      default: break;
  }
  exec(cmd, function(err, stdout, stderr){
      cb(stdout);
  });
}

function countOcurrences(str, value, isProgramName) {
  if(!isProgramName)
  {
    var regExp = new RegExp(value, "gi");
    return (str.match(regExp) || []).length;
  }
  else
  {
    str = str.replace('\r\n', '\n')
    var split = str.split('\n')
    var count = 0
    split.forEach(function(element){
      var split2 = element.split('/')
      if(split2[split2.length - 1] == value)
      {
        count += 1
      }
    })

    return count
  }
}

function getPrice()
{
  var serverUrl = "data.snowgem.org"
  var backupUrl = "rates.snowgem.org"
  var path =  '/rates/index.html'
  var request = require('request');
  request('https://' + serverUrl + path, function (error, response, body) {
    if(response == undefined || response.statusCode != 200)
    {
      request('https://' + backupUrl + path, function (error, response, body) {
        if(response == undefined || response.statusCode != 200){
          request('http://' + serverUrl + path, function (error, response, body) {
            if(response == undefined || response.statusCode != 200){
              request('http://' + backupUrl + path, function (error, response, body) {
                if(response == undefined || response.statusCode != 200){
                  setTimeout(getPrice, 60000)
                }
                else
                {
                  ipc.send('main-update-price', String(body))
                }
              })
            }
            else
            {
              ipc.send('main-update-price', String(body))
            }
          })
        }
        else
        {
          ipc.send('main-update-price', String(body))
        }
      })
    }
    else
    {
      ipc.send('main-update-price', String(body))
    }
  });
}

function filter_array(test_array) {
  var index = -1;
  var arr_length = test_array ? test_array.length : 0;
  var resIndex = -1;
  var result = [];

  while (++index < arr_length) {
      var value = test_array[index];

      if (value) {
          result[++resIndex] = value;
      }
  }

  return result;
}

function readConfig(serverData){
  var fileName = getUserHome(serverData, settings) + "/" + serverData.conf_file
  var data = {}
  if(fs.existsSync(fileName))
  {
    var fileData = String(fs.readFileSync(fileName))
    var fileData = fileData.replace(new RegExp('\r?\n','g'), '\n')
    fileData = fileData.split('\n')
    fileData = filter_array(fileData)
    fileData.forEach(function(element){
      var split = element.split('=')
      if(split.length == 2)
      {
        data[split[0]] = split[1]
      }
    })
  }
  return data
}

function writeConfig(data){
  var key = Object.keys(data)
  var dataToWrite = ""
  key.forEach(function(element){
    dataToWrite += element + '=' + data[element] + '\n'
  })
  var fileName = getUserHome(serverData, settings) + "/" + serverData.conf_file
  fs.writeFileSync(fileName, dataToWrite)
}

function checkBlockchain(serverData, args)
{
  var homeDir = getUserHome(serverData, settings)
  var index = args.findIndex(function(e){return e == '-reindex'})
  if(!fs.existsSync(homeDir + "/blocks") || index > -1)
  {
    return false
  }
  else
  {
    return true
  }
}

function checkNoticeDisplay(serverData, type, name)
{
  var loc = getWalletHome(false, currentCoin) + "/temp.dat"
  var curr = Math.round((new Date()).getTime() / 1000)
  if(fs.existsSync(loc))
  {
    var content = fs.readFileSync(loc, 'utf8')
    try
    {
      content = JSON.parse(content)
      var eleLocal = content.notice.findIndex(function(e){return e.type == type && e.name == name})
      if(eleLocal > -1)
      {
        if(parseInt(content.notice[eleLocal].time) + serverData.noticetimer > curr &&
          parseInt(content.notice[eleLocal].time) < curr)
        {
          return false
        }
        else
        {
          return true
        }
      }
      else
      {
        return true
      }
    }
    catch(ex){

    }
  }
  return true
}

function saveNoticeDisplay(type, name)
{
  var loc = getWalletHome(false, currentCoin) + "/temp.dat"
  var curr = Math.round((new Date()).getTime() / 1000)
  if(fs.existsSync(loc))
  {
    var content = fs.readFileSync(loc, 'utf8')
    try
    {
      content = JSON.parse(content)
      var eleLocal = content.notice.findIndex(function(e){return e.type == type && e.name == name})
      if(eleLocal > -1)
      {
        content.notice[eleLocal].time = curr
        fs.writeFileSync(loc, JSON.stringify(content))
        return
      }
      else
      {
        var temp = {}
        temp["type"] = type
        temp["name"] = name
        temp["time"] = curr
        content.notice.push(temp)
        fs.writeFileSync(loc, JSON.stringify(content))
        return
      }
    }
    catch(ex){

    }
  }
  content = {}
  content.notice = []
  var temp = {}
  temp["type"] = type
  temp["time"] = curr
  temp["name"] = name
  content.notice.push(temp)
  fs.writeFileSync(loc, JSON.stringify(content))
}

//#region 
/************
 * Bot region
 */

function clearBot(type)
{
    if(bot != undefined)
    {
        if(type == "Telegram")
        {
            bot.stopPolling();
            bot = undefined;
        }
        else if(type == "Discord")
        {
            bot = undefined;
        }
    }
}
function initBot(type, key)
{
    console.log("Key = " + key);
    if(bot == undefined)
    {
        if(type == "Telegram")
        {
            bot = new TelegramBot(key, {polling: {interval: 1000} });
            bot.on('message', function(message) {
                console.log(message);
            });

            bot.on('error', function(message) {
                console.log("Error");
            })

            bot.on('polling_error', function(message) {
                //clearBot(type);
                console.log(message);
            })

            bot.on('channel_post', function(message) {
                console.log(message)
                var txt = message.text.toLowerCase();
                replyMessage(txt, message.chat.id);
            })
            
        }
        else if(type == "Discord")
        {
            bot = new Discord.Client();
            bot.login(key);
            bot.on('message', function(message) {
                console.log(message);
                if (message.author.bot) return;
                var txt = message.content.toLowerCase();
                replyMessage(txt, message.author.id);
            });
        }
    }
}

function replyMessage(txt, id)
{
  var res = txt.split(" ");
  console.log(res.length)
  console.log(res)
  var botStr = settings.botname + "\n"
  //if(res[0][0] == '/')
  {
    var command = res[1];
    var agr = res[0];
    if (agr && (agr == settings.botname.toLowerCase() || agr == "all"))
    {
      if(command == "initbot")
      {
        settings.botid = id
        saveSettings(settings, currentCoin)
        sendMessage(settings.bot, id, botStr + "Init successfully");
      }
      else if(command == "noti")
      {
        var msg
        if(res[2].toLowerCase() == "enable")
        {
          settings.botnoti = true
          msg = "Enable notification"
        }
        else
        {
          settings.botnoti = false
          msg = "Disable notification"
        }
        saveSettings(settings, currentCoin)
        sendMessage(settings.bot, id, botStr + msg + " successfully");
      }
      else if(command == "shieldall")
      {
        isBotCmd = true
        if(res[2])
        {
          var data = {}
          data.shieldthreshold = 8
          var values = Object.keys(book)
          var keys = Object.values(book)
          var idx = keys.findIndex(function(e){return e == res[2]})
          if(idx > -1)
          {
            data.shieldaddress = values[idx]
          }
          else
          {
            data.shieldaddress = res[2]
          }
          data.isBot = true
          sendMessage(settings.bot, id, botStr + "Shielding all generated coin to " + data.shieldaddress);
          electron.ipcRenderer.send('main-execute-shield-all', data)
        }
        else
        {
          createHelpMessage(command)
        }
      }
      else if(command == "send")
      {
        isBotCmd = true
        if(res[2] && res[3] && res[4])
        {
          var data = {}
          var values = Object.keys(book)
          var keys = Object.values(book)
          var idx = keys.findIndex(function(e){return e == res[2]})
          if(idx > -1)
          {
            data.from = values[idx]
          }
          else
          {
            data.from = res[2]
          }

          idx = keys.findIndex(function(e){return e == res[3]})
          if(idx > -1)
          {
            data.to = values[idx]
          }
          else
          {
            data.to = res[3]
          }

          if(isNaN(res[4]))
          {
            createHelpMessage(command)
            return
          }
          else
          {
            data.value = +res[4]
          }

          data.isBot = true
          sendMessage(settings.bot, id, botStr + "Sending " + data.value + " from " + data.from + " to " + data.to)
          electron.ipcRenderer.send('main-execute-send-coin', data)
        }
        else
        {
          createHelpMessage(command)
        }
      }
      else if(command == "getaddrbook")
      {
        var inside = []
        var outside= []
        var keys = Object.keys(walletDic)
        addrBook.forEach(function(element){
          var index = keys.findIndex(function(e){return e.includes(element.text)})
          if(index> -1)
          {
            inside.push(element.text)
          }
          else
          {
            outside.push(element.text)
          }
        });
        var msg = "your addresses: " + inside.join(", ")
        msg += "\nnot your addresses: " + outside.join(", ")
        sendMessage(settings.bot, id, botStr + msg);
      }
      else if(command == "getaddr")
      {
        var addr = ""
        if(res[2])
        {
          addrBook.some(function(element){
            if(element.text == res[2])
            {
              addr = element.value
              return
            }
          });
          var msg = botStr + addr
          sendMessage(settings.bot, id, msg);
        }
        else
        {
          createHelpMessage(command)
        }
      }
      else if(command == "stats")
      {
        sendMessage(settings.bot, id, createNotiData());
      }
      else if(command == "mns")
      {
        sendMessage(settings.bot, id, createMNData());
      }
      else if(command == "mndetail")
      {
        sendMessage(settings.bot, id, createMNData(res[2]));
      }
      else if(command == "txs")
      {
        sendMessage(settings.bot, id, createTxData(parseInt(res[2])));
      }
      else if(command == "price")
      {
        sendMessage(settings.bot, id, botStr + priceandsymbol);
      }
      else if(command == "getid")
      {
        msg = settings.botname + "\n" + id;
        sendMessage(settings.bot, id, msg);
      }
      else if(command == "name")
      {
        msg = settings.botname + "\n";
        sendMessage(settings.bot, id, msg);
      }
      else if(command == "restart")
      {
        //start mining
        msg = settings.botname + " will restart after 1 minute";
        sendMessage(settings.bot, id, msg);
        restartPC();
      }
      else if(command == "help")
      {
        //send help
        if(res.length == 3)
        {
          var cmd = res[2];
          var msg = createHelpMessage(cmd);
          sendMessage(settings.bot, id, msg);
        }
        else
        {
          sendHelp(settings.botname + ":\n", id);
        }
      }
      else if(command == "ip")
      {
        publicIp.v4().then(function(ip){
          localip = ip
          var msg = settings.botname + " ip: " + localip;
          sendMessage(settings.bot, id, msg);
        })
      }
      else
      {
        sendHelp(settings.botname + "\n", id);
      }
    }
  }
}

function createNotiData()
{
  return settings.botname + "\n" + JSON.stringify(balance, null, 2)
}

function createMNData(alias)
{
  var data = []

  localMNs.forEach(function(element){
    alias == undefined ? data.push(element.alias) :
      (element.alias == alias ? data.push(element) : "")
  })
  
  var botStr = settings.botname + "\n"
  if(data.length == 0 && alias == undefined)
  {
    return botStr + "Cannot find any masternode in your wallet"
  }
  else if(data.length == 0 && alias != undefined)
  {
    return botStr + "Cannot find " + alias + " in your wallet"
  }
  if(alias == undefined)
    return botStr + data.join(', ')
  else
    return botStr + JSON.stringify(data, null, 2)
}

function createTxData(noTx)
{
  var data = []
  if(noTx <= 0)
  {
    noTx = 5
  }
  else if(noTx > 5)
  {
    noTx = 5
  }
  else if(isNaN(noTx))
  {
    noTx = 1
  }
  transactions.some(function(element){
    var temp = {}
    if(data.length < noTx)
    {
      temp['no'] = data.length + 1
      temp['direction'] = element.direction
      temp['date'] = element.date
      temp['address'] = element.address
      temp['amount'] = element.amount
      temp['validated'] = element.validated
      temp['confirmations'] = element.confirmations
      data.push(temp)
    }
    else
    {
      return
    }
  });
  return settings.botname + "\n" + JSON.stringify(data, null, 2)
}

function createHelpMessage(cmd)
{
  var msg = "";
  if(cmd == "initbot")
  {
    msg = "\n\
    ``initbot``\n\
    Init bot data\n\
    \nResult:\n\
      Returns initialization success message\n\
    \nExamples:\n\
    wallet1 initbot"
  }
  else if(cmd == "stats")
  {
    msg = "\n\
    ``stats``\n\
    Get wallet information\n\
    \nExamples:\n\
    wallet1 stats"
  }
  else if(cmd == "getaddrbook")
  {
    msg = "\n\
    ``getaddrbook``\n\
    Get all address book in wallet\n\
    \nExamples:\n\
    wallet1 getaddrbook"
  }
  else if(cmd == "getaddr")
  {
    msg = "\n\
    ``getaddr addressbook``\n\
    Get address from specific address book in wallet\n\
    \nArguments:\n\
    1. \"addressbook\"   (string, required) address book to get wallet address\n\
    \nExamples:\n\
      wallet1 getaddrbook book1"
  }
  else if(cmd == "shieldall")
  {
    msg = "\n\
    ``shieldall toaddress``\n\
    Get address from specific address book in wallet\n\
    \nArguments:\n\
    1. \"toaddress\"   (string, required) address book or private address to be received shield coin\n\
    \nExamples:\n\
      wallet1 getaddrbook shieldall\n\
      wallet1 getaddrbook shieldall zs1yezn5j36lwjj9yfywehqt0l3ptke3aek4gmsvcehtwdm17l9qywp7ze4zcelxy4ep8ygk6nh2yz"
  }
  else if(cmd == "send")
  {
    msg = "\n\
    ``send fromaddress toaddress amount``\n\
    Get address from specific address book in wallet\n\
    \nArguments:\n\
    1. \"fromaddress\"   (string, required) address book or address to send coin\n\
    2. \"toaddress\"   (string, required) address book or address to be received coin\n\
    3. \"amount\"   (numberic, required) amount to send\n\
    \nExamples:\n\
      wallet1 send sapling_shield add1 0.5"
  }
  else if(cmd == "mns")
  {
    msg = "\n\
    ``mns``\n\
    Get all alias in your wallet\n\
    \nExamples:\n\
      wallet1 mns"
  }
  else if(cmd == "mndetail")
  {
    msg = "\n\
    ``mndetail aliasname``\n\
    Get masternode detail for specific masternode\n\
    \nArguments:\n\
    1. \"aliasname\"   (string, required) alias name\n\
    \nExamples:\n\
      wallet1 mndetail mn1"
  }
  else if(cmd == "txs")
  {
    msg = "\n\
    ``txs numbertoget``\n\
    Get some latest transactions\n\
    \nArguments:\n\
    1. \"numbertoget\"   (number, optional) number of transactions to get (1-5)\n\
    \nExamples:\n\
      wallet1 txs\n\
      wallet1 txs 3"
  }
  else if(cmd == "price")
  {
    msg = "\n\
    ``price``\n\
    Get SnowGem price\n\
    \nExamples:\n\
      wallet1 price"
  }
  return msg;
}

function sendHelp(begining, id)
{
  var msg = "";
  if(begining)
  {
    msg += begining;
  }
  msg += "Command structure: <walletname> <command> <agruments>\n";
  msg += "For example: wallet1 stats\n";
  msg += "If you put 'all' to second parameter, all PCs will reply\n";
  msg += "For example: ``all stats``\n\n";
  msg += "Use '<walletname> help <command>' to display more detail\n";
  msg += "For example: ``wallet1 help send``\n\n";
  msg += "Supported commands:\n";
  msg += "help - display help message\n";
  msg += "initbot - initialize bot\n";
  // msg += "noti - enable/disable bot notication\n";
  msg += "stats - get wallet info\n";
  msg += "getaddrbook - get wallet name from book\n";
  msg += "getaddr - get wallet address from name\n";
  msg += "shieldall - shield all genmerated coin\n";
  msg += "send - send coin\n";
  msg += "mns - get masternode list\n";
  msg += "mndetail - get masternode detail\n";
  msg += "txs - get some latest transactions\n";
  msg += "price - get coin price\n";
  msg += "name - get bot name\n";
  msg += "getid - get user ID (Discord)\n"
  msg += "restart - restart PC\n"
  msg += "ip - get public ip address"
  sendMessage(settings.bot, id, msg);
}

function sendBotReplyMsg(msg)
{
  var botStr = settings.botname + "\n"
  if(settings.botid)
  {
    sendMessage(settings.bot, settings.botid, botStr + msg)
  }
  else
  {
    sendMessage(settings.bot, settings.botid, botStr + "you have to init bot before receiving done signal")
  }
  isBotCmd = false
}

function sendMessage(type, id, msg)
{
  if(bot != undefined)
  {
    try
    {
      var dateFormat = require('dateformat');
      var now = new Date();
      formatted = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
      msg = formatted + "\n" + msg;
      if(msg[msg.length - 1] == '\n')
      {
        msg = msg + "=========================";
      }
      else
      {
        msg = msg + "\n=========================";
      }
      if(type == "Telegram")
      {
        bot.sendMessage(id, msg);
      }
      else if(type == "Discord")
      {
        bot.users.get(id).send(msg);
      }
    }
    catch(err) {
      console.log("Send message error");
      writeLog(err);
    }
  }
}

//#endregion

function curlData(username, password, port, methods, params, coinType){
  var temp = [methods.slice(0, methods.length)]
  temp = temp.concat(params)
  if(methods == 'z_getoperationstatus')
  {
    params.splice(1,1)
  }
  else if(methods == 'getdebug')
  {
    methods = params[0]
    params.splice(0,1)
  }
  else if(methods.includes('validateaddress'))
  {
    if(params.length > 1)
    {
      params.splice(1, 1)
    }
  }
  var options = {
      url: "http://localhost:" + port,
      method: "post",
      headers:
      { 
        "content-type": "text/plain"
      },
      auth: {
          user: username,
          pass: password
      },
      body: JSON.stringify( {"jsonrpc": "1.0", "id": "getdata", "method": methods, "params": params })
  };

  request(options, function(error, response, body) {
      if (error) {
        var rtnData = {}
        rtnData['key'] = temp[0]
        rtnData['arg'] = temp
        rtnData['value'] = error
        if(coinType == 'snowgem')
        {
          handleFunction(rtnData)
        }
        else if(coinType == 'zcash')
        {
          handleFunctionZcash(rtnData)
        }
        else
        {
          writeLog("curlData not supported")
        }
      } else {
        var rtnData = {}
        var data = body
        try
        {
          data = JSON.parse(body)
        }
        catch(ex){}
        rtnData['key'] = temp[0]
        rtnData['arg'] = temp
        rtnData['value'] = data
        if(coinType == 'snowgem')
        {
          handleFunction(rtnData)
        }
        else if(coinType == 'zcash')
        {
          handleFunctionZcash(rtnData)
        }
        else
        {
          writeLog("curlData not supported")
        }
      }
  })
}
app.controller('MenuBarCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.ScreenType = {"LOADING":0, "OVERVIEW": 1, "SEND":2, "SHIELD":3, "ADDRESSES": 4, "TRANSACTIONS": 5, "MASTERNODES": 6, "MASTERNODES_CONFIG": 7, "APPS": 8, "EXCHANGES": 9, "SETTINGS": 10, 'DEFAULT_SETTINGS': 11, 'MASTERNODES_MAP': 12}
  $scope.detail = {hideMasternode: true, hideCoinList: true, coins: {}, title: "", text: "", btn: ""}
  $scope.detail.activeMasternode = 'site-menu-item has-sub'
  $scope.detail.activeApps = 'site-menu-item has-sub'
  $scope.detail.activeExchanges = 'site-menu-item has-sub'
  $scope.detail.coinSelect = undefined
  $scope.menubarClick = function(data, url, isCheck){
    if(isCheck == undefined)
    {
      isCheck = true
    }
    showTab(data, isCheck)
    $(window).scrollTop(0);

    if(data == $scope.ScreenType.MASTERNODES || data == $scope.ScreenType.MASTERNODES_CONFIG || data == $scope.ScreenType.MASTERNODES_MAP)
    {
      if($scope.detail.activeMasternode != 'site-menu-item has-sub active')
      {
        var tabcontent = document.getElementsByClassName("site-menu-item")
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].className = tabcontent[i].className.replace(" active", "");
            tabcontent[i].style.backgroundColor = "";
        }
        $scope.detail.activeMasternode =  'site-menu-item has-sub active'
      }
    }
    else
    {
      $scope.detail.activeMasternode =  'site-menu-item has-sub'
    }
    if(data == $scope.ScreenType.SNOWMINE)
    {
      if($scope.detail.activeApps != 'site-menu-item has-sub active')
      {
        var tabcontent = document.getElementsByClassName("site-menu-item")
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].className = tabcontent[i].className.replace(" active", "");
            tabcontent[i].style.backgroundColor = "";
        }
        $scope.detail.activeApps =  'site-menu-item has-sub active'
      }
    }
    else
    {
      $scope.detail.activeApps =  'site-menu-item has-sub'
    }
    if(data == $scope.ScreenType.MERCATOX)
    {
      shell.openExternal(url)
    }
    else
    {
      $scope.detail.activeExchanges =  'site-menu-item has-sub'
    }

  }

  $scope.openExternal = function(url)
  {
    shell.openExternal(url)
  }

  $scope.coinSelect = function(coin)
  {
    $scope.detail.title = "Restart Wallet"
    $scope.detail.text = "Do you want to select " + coin + ". Please wait until wallet is reloaded."
    $scope.detail.btn = "Restart Wallet"
    $scope.detail.coinSelect = coin
    $('#restartWalletMenubar').modal()
  }

  $scope.restartAction = function(){
    //check wallet status
    var currData = {}
    writeLog($scope.detail.coinSelect)
    currData["coinname"] = $scope.detail.coinSelect
    saveCurrentCoin(JSON.stringify(currData))
    helpData = undefined
    setTimeout(walletStatusTimerFunction, 500)
  }

  function walletStatusTimerFunction(){
    // writeLog(helpData)
    stopWallet()
    checkWallet()
    if(helpData != null  && helpData != undefined)
    {
      if (helpData.result == null && helpData.errno != undefined)
      {
        //refresh wallet
        var arg = []
        electron.ipcRenderer.send('main-reload', arg)
      }
      else
      {
        setTimeout(walletStatusTimerFunction, 2000)
      }
    }
    else
    {
      setTimeout(walletStatusTimerFunction, 500)
    }
  }

  electron.ipcRenderer.on('child-show-screen', function(event, msgData){
    var scrn = msgData.msg[0]
    var isCheck = msgData.msg[1]
    $scope.menubarClick(scrn, undefined, isCheck)
  })

  electron.ipcRenderer.on('child-update-settings', function(event, msgData){
    $timeout(function(){
      if(msgData.msg[2] != null && msgData.msg[2] != undefined)
      {
        $scope.detail.hideMasternode = !msgData.msg[2].masternode
        $scope.detail.currentCoin = currentCoin
        writeLog($scope.detail.hideMasternode)
      }
      if(coinList.coins != undefined && coinList.coins.length > 0)
      {
        $scope.detail.coins = coinList.coins
        $scope.detail.hideCoinList = false
      }
    },0)
  })
}])

app.controller('NavBarCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.detail = {}
  $scope.detail.progress = 0
  $scope.detail.hideBar = true
  $scope.detail.connections = 0
  $scope.detail.currentblock = ''
  $scope.detail.hideprice = true
  $scope.detail.banners = undefined
  $scope.detail.showNoti = false

  $scope.refreshWallet = function(){
    var arg = []
    electron.ipcRenderer.send('main-reload', arg)
  }

  electron.ipcRenderer.on('child-update-loading', function(event, msgData) {
    var data = msgData.msg
    var bestTime = data.besttime
    var currTime = Math.floor(Date.now() / 1000)
    var startTime = serverData.starttime == undefined ? 1511111234 : serverData.starttime
    $timeout(function(){
      $scope.detail.progress = parseInt(bestTime - startTime) / (currTime - startTime) * 100
      $scope.detail.width = $scope.detail.progress.toFixed(2) + '%'
      $scope.detail.synctitle = $scope.detail.width + " (" + timeConverter(bestTime) + ')'
      $scope.detail.connections = data.connections
      $scope.detail.currentblock = data.block == undefined ? "" : ", current block: data.block"
      if(currTime - bestTime < 1000)
      {
        $scope.detail.hideBar = true
        isSynced = true
      }
      else
      {
        $scope.detail.hideBar = false
        isSynced = false
      }
    },0)
  })

  electron.ipcRenderer.on('child-notification-data', function(event, msgData) {
    var data = msgData.msg
    data = data.banner
    $timeout(function(){
      $scope.detail.notificationCounter = data.length
      $scope.detail.banners = data
      if($scope.detail.notificationCounter > 0)
      {
        $scope.detail.showNoti = true
      }
      else
      {
        $scope.detail.showNoti = false
      }
    },0)
  })

  electron.ipcRenderer.on('child-update-price', function(event, msgData) {
    $timeout(function(){
      if($scope.detail.hideprice == true)
      {
        if(serverData != undefined && serverData.coinname == "SnowGem")
        {
          $scope.detail.hideprice = false
        }
      }
      if(settings.currency == undefined)
      {
        settings.currency = 'USD'
        settings.symbol = '$'
      }
      try
      {
        var data = JSON.parse(msgData.msg)
        data.some(function(element){
          if(element.code == settings.currency)
          {
            $scope.detail.pricechange = data[1].pricechange
            $scope.detail.price = (parseFloat(element.rate))
            priceandsymbol = $scope.detail.priceandsymbol = settings.symbol + $scope.detail.price
            
            setTimeout(getPrice, 60000)
            return
          }
        })
      }
      catch(ex)
      {
        setTimeout(getPrice, 60000)
      }
    },0)
  })
}])

app.controller('SiteGridMenuCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.ScreenType = {"LOADING":0, "OVERVIEW": 1, "SEND":2, "SHIELD":3, "ADDRESSES": 4, "TRANSACTIONS": 5, "MASTERNODES": 6, "MASTERNODE_CONFIG": 7, "SNOWMINE": 8, "MERCATOX": 9, "SETTINGS": 10}
  $scope.menubarClick = function(data){
    showTab(data, true)
  }
}])

app.controller('MenuBarFooterCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.ScreenType = {"LOADING":0, "OVERVIEW": 1, "SEND":2, "SHIELD":3, "ADDRESSES": 4, "TRANSACTIONS": 5, "MASTERNODES": 6, "MASTERNODE_CONFIG": 7, "SNOWMINE": 8, "MERCATOX": 9, "SETTINGS": 10}
  $scope.menubarClick = function(data){
    if(settings == undefined || serverData == undefined || confData == undefined)
    {
      showTab(data, true)
    }
    else
    {
      showTab(data, false)
    }
  }
}])

app.controller('BottomCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.detail = {}
  setInterval(function(){
    $timeout(function(){
      var currentdate = Date.now() / 1000; 
      $scope.detail.currenttime = timeConverter(currentdate);
    },0)
  }, 250);
}])

app.controller('AddressesCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {

  $scope.addresses = []
  $scope.selectedList = {}
  $scope.selectedListClone = {}
  $scope.importList = []
  $scope.detail = {}
  $scope.privKeyList = {}
  $scope.detail.current = {}
  $scope.detail.privKeyText = "Get Privatekey"
  $scope.detail.enableButton = true
  $scope.detail.alertText = ""
  $scope.detail.enableGetPrivKey = false
  $scope.detail.enableImportKey = true
  $scope.detail.hideZeroAddress = false
  $scope.detail.showGetPrivKey = false
  $scope.detail.sapling = false
  $scope.detail.hideZeroAddressText
  $scope.detail.currentCoin
  $scope.detail.shieldAddress
  $scope.detail.importWithRescan = true
  $scope.detail.importPrivKeyText = "Import Privatekeys"

  var isPrivate
  var isSapling
  var importingTimer = undefined
  var countingImport = 1
  var addrData
  var newName
  // $scope.detail.book = readAddressBook(false, serverData, currentCoin)
  // $scope.detail.bookKeys = Object.keys($scope.detail.book)
  
  var isImport = false
  var isContinueImport = false
  function showAlert(id, title, text)
  {
    var arg = [ScreenType.ADDRESSES]
    $timeout(function(){
      $scope.detail.title = title
      $scope.detail.alertText = text
      $(id).modal()
    },0)
  }

  function updateAddress(address, newBook)
  {
    writeLog(newBook)
    var index = $scope.addresses.findIndex(function(e){return e.address == address})
    writeLog(index)
    if(index > -1)
    {
      $scope.addresses[index].book = newBook
    }
  }

  function updateImportingText(){
    if(countingImport == 1)
    {
      $scope.detail.importPrivKeyText = "Importing."
      countingImport+=1
    }
    else if(countingImport == 2)
    {
      $scope.detail.importPrivKeyText = "Importing.."
      countingImport+=1
    }
    else if(countingImport == 3)
    {
      $scope.detail.importPrivKeyText = "Importing..."
      countingImport=1
    }
  }

  function populateAddress(data, hideZeroAddress){
    var walletDic = data.from
    var keys = Object.keys(walletDic)
    var count = 1
    $timeout(function(){
      $scope.addresses = []
      keys.forEach(function(element) {
        var temp = {}
        temp['no'] = count
        temp['copy'] = ""
        var split = element.split(' ')
        temp['address'] = element.split(' ')[0]
        if(split.length > 1)
        {
          var newbook = element.split(temp['address'] + ' ')[1]
          if(newbook.startsWith('('))
          {
            newbook = newbook.slice(1, newbook.length - 1)
          }
          if(newbook.endsWith(')'))
          {
            newbook = newbook.splice(0, newbook.length - 2)
          }
          temp['book'] = newbook
        }
        var type
        if(element.startsWith('z'))
        {
          type = 'private'
        }
        else
        {
          type = 'public'
        }
        if(walletDic[element].ismine == false)
        {
          type = 'read-only'
        }
        temp['type'] = type
        temp['amount'] = walletDic[element].amount
        if(!(hideZeroAddress == true && temp['amount'] == 0))
        {
          $scope.addresses.push(temp)
          var selectedKeys = Object.keys($scope.selectedList)
          var index = selectedKeys.findIndex(function(e){return e === temp.address})
        
          if(index == -1 && temp.type != 'read-only')
          {
            $scope.selectedList[temp.address] = false
          }
          count += 1
        }
      })
      $scope.detail.enableButton = true
    },0)
  }

  function countSelected(keys){
    var selectedCount = 0
    keys.forEach(function(element) {
      if($scope.selectedList[element] == true)
      {
        selectedCount += 1
      }
    })
    return selectedCount
  }

  $scope.deleteBook = function(name, address){
    $timeout(function(){
      var index = $scope.detail.bookKeys.findIndex(function(e){return e == address})
      $scope.detail.bookKeys.splice(index,1)
      delete $scope.detail.book[address]
    },0)
  }

  $scope.cancelAddressBookAction = function(){
    $timeout(function(){
      $scope.detail.book = readAddressBook(false, serverData, currentCoin)
      $scope.detail.bookKeys = Object.keys($scope.detail.book)
    },0)
  }

  $scope.editAddressBookAction = function(){
    editAddressBook($scope.detail.book, serverData, currentCoin)
    book = readAddressBook(true, serverData, currentCoin)
    shouldGetWallet = true
  }

  $scope.editAddressBook = function(){
    $scope.detail.book = readAddressBook(false, serverData, currentCoin)
    $scope.detail.bookKeys = Object.keys($scope.detail.book)
    $scope.detail.bookKeys.sort()
    showAlert('#modalEditAddressBook', 'Edit Address Book')
  }

  $scope.bookChange = function(newName, address){
    // writeLog(newName)
    $timeout(function(){
      $scope.detail.book[address] = newName
      editAddressBook($scope.detail.book, serverData, currentCoin)
      book = readAddressBook(true, serverData, currentCoin)
      shouldGetWallet = true
    },0)
  }

  $scope.select = function(addr, isSelected){
    var index = $scope.addresses.findIndex(function(e) {return e.address === addr})
    if($scope.addresses[index].type == 'read-only')
    {
      $scope.selectedList[addr] = false
      showAlert('#modalAddressNoti', 'Alert!!!', 'Can not select read-only address')
    }
    else
    {
      $scope.selectedList[addr] = isSelected
      var keys = Object.keys($scope.selectedList)
      var count = 0
      keys.forEach(function(element) {
        if($scope.selectedList[element] == true)
        {
          count += 1
        }
      })

      if(count >= 1)
      {
        $scope.detail.showGetPrivKey = true
        $scope.detail.enableGetPrivKey = true
        if(count >= 2)
        {
          $scope.detail.privKeyText = "Get Privatekeys"
        }
        else
        {
          $scope.detail.privKeyText = "Get Privatekey"
        }
      }
      else
      {
        $scope.detail.showGetPrivKey = false
      }
    }
  }

  $scope.selectAllClick = function(isSelected){
    var keys = Object.keys($scope.selectedList)
    keys.forEach(function(element){
      var index = $scope.addresses.findIndex(function(e){return e.address === element})
      if($scope.addresses[index].type != 'read-only')
      {
        $scope.selectedList[element] = isSelected
      }
    })
    if(isSelected)
    {
      $scope.detail.privKeyText = "Get Privatekeys"
      $scope.detail.showGetPrivKey = true
      $scope.detail.enableGetPrivKey = true
    }
    else
    {
      $scope.detail.showGetPrivKey = false
    }
  }

  $scope.newAddress = function(){
    isPrivate = false
    showAlert('#modalAddressNewAddress', 'Create new public address')
  }

  $scope.newPrivateAddress = function(sapling){
    isPrivate = true
    isSapling = sapling
    showAlert('#modalAddressNewAddress', 'Create new private address')
  }

  $scope.createAddress = function(event)
  {
    console.log($scope.detail.addressName)
    if(event != undefined)
    {
      event.preventDefault()
      if (event.keyCode === 13) {
        $('#modalAddressNewAddress').modal('hide')
      }
      else
      {
        return
      }
    }

    if(!$scope.detail.addressName)
    {
      showAlert('#modalAddressNoti', 'FAILED!!!', "Name could not be empty")
      return
    }
    book = readAddressBook(true, serverData, currentCoin)
    var keys = Object.values(book)
    if(keys.includes($scope.detail.addressName))
    {
      showAlert('#modalAddressNoti', 'FAILED!!!', "Duplicate name")
      return
    }
    newName = $scope.detail.addressName
    $scope.detail.addressName = ""
    if(isPrivate == false)
    {
      newAddress()
      shouldGetAll = true
      $scope.detail.enableButton = false
    }
    else
    {
      newZAddress(isSapling)
      shouldGetAll = true
      $scope.detail.enableButton = false
    }
  }

  $scope.getPrivKey = function(){
    $scope.privKeyList = {}
    var keys = Object.keys($scope.selectedList)
    keys.forEach(function(element){
      if($scope.selectedList[element] == true)
      {
        $scope.selectedListClone[element] = true
      }
    });
    $scope.detail.enableGetPrivKey = false
    privKey()
  }

  function privKey(){
    var keys = Object.keys($scope.selectedListClone)

    var addr = keys[0]
    delete $scope.selectedListClone[addr]
    if(!addr.startsWith('z'))
    {
      exportPrivateKey(addr.split(' ')[0])
    }
    else
    {
      z_exportPrivateKey(addr.split(' ')[0])
    }
  }

  $scope.importPrivKey = function()
  {
    isImport = true
    showAlert('#modalAddressNoti', 'Attention', 'Importing address takes long time, your wallet information will not be updated until this progress is finished.\nIt may take more than 10 minutes')
  }

  $scope.closeAlertAction = function(){
    if(isImport)
    {
      $('#importPrivatekeys').modal()
      isImport = false
    }
    else if(isContinueImport)
    {
      setTimeout(continueImport, 1000)
      isContinueImport = false
    }
  }

  $scope.importAction = function(){
    $scope.importList = $scope.detail.privKeysImport.replace('\r\n', '\n').split('\n')
    $scope.detail.privKeysImport = undefined
    if($scope.importList.length > 0)
    {
      if(importingTimer == undefined)
      {
        importingTimer = setInterval(updateImportingText, 1000);
      }
      importKey()
    }
  }

  $scope.newAddressBook = function(){
    $scope.detail.current.name = ''
    $scope.detail.current.address = ''
    $scope.detail.current.readonly = false
    showAlert('#modalNewAddressBook', 'Add New Address Book')
  }

  $scope.viewBook = function(addr, name){
    $scope.detail.current.name = name
    $scope.detail.current.address = addr
    $scope.detail.current.readonly = true
    showAlert('#modalNewAddressBook', 'View Address Book')
  }

  $scope.createAction = function(name, address){
    $scope.detail.current.address = undefined
    $scope.detail.current.name = undefined
    updateAddress(address, name)
    var rtn = addAddressBook(name, address, serverData, currentCoin)
    if(rtn.result == true)
    {
      book = rtn.book
      shouldGetWallet = true
    }
    else
    {
      //display alert
      showAlert('#modalAddressNoti', 'FAILED!!!', rtn.error)
    }
  }

  function importKey(data)
  {
    $timeout(function(){
      if(data != undefined && data.msg.value.error != null)
      {
        var errMsg = "Cannot import " + data.msg.arg[1] + "\n\n"
        errMsg += data.msg.value.error.message
        isContinueImport = true
        showAlert('#modalAddressError', 'Error!!!', errMsg)
      }
      else
      {
        continueImport()
      }
      
    },0)
  }

  function continueImport()
  {
    if($scope.importList.length == 0)
    {
      shouldGetAll = true
      $scope.detail.enableImportKey = true
      showAlert('#modalAddressNoti', '', 'Done')
      clearTimeout(importingTimer)
      importingTimer = undefined
      $scope.detail.importPrivKeyText = "Import Privatekeys"
      return
    }
    $scope.detail.enableImportKey = false
    var priv1 = $scope.importList[0]
    $scope.importList.splice(0,1)
    writeLog($scope.importList.length)
    if(priv1.startsWith('K') || priv1.startsWith('L'))
    {
      importPrivateKey(priv1, "", $scope.detail.importWithRescan)
    }
    else
    {
      z_importPrivateKey(priv1, $scope.detail.importWithRescan, 0)
    }
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  $scope.viewQrcode = function(address) {
    var canvas = document.getElementById('qrcode')
 
    QRCode.toCanvas(canvas, address, {width: 256}, function (error) {
      if (error) console.error(error)
      showAlert('#modalQrCode', address)
    })
  }

  $scope.hideZeroAddressClick = function(){
    $scope.detail.hideZeroAddress = !$scope.detail.hideZeroAddress
    if($scope.detail.hideZeroAddress == false || $scope.detail.hideZeroAddress == undefined)
    {
      $scope.detail.hideZeroAddressText = "Hide Zero Balance"
    }
    else
    {
      $scope.detail.hideZeroAddressText = "Show Zero Balance"
    }
    var settings = readSettings($scope.detail.currentCoin)
    settings.hidezeroaddress = $scope.detail.hideZeroAddress
    populateAddress(addrData, $scope.detail.hideZeroAddress)
    saveSettings(settings, $scope.detail.currentCoin)
    // var arg = [settings]
    // ipc.send('main-update-settings', arg)
  }

  $scope.multipleShieldClick = function(){
    if($scope.detail.shieldAddress == null || $scope.detail.shieldAddress == undefined)
    {
      showAlert('#modalAddressNoti', 'Alert!!!', 'Please select private address in Settings before using this feature')
    }
    else
    {
      showAlert('#shieldAllConfirmationAddr', 'Are you sure?', 'Do you want to shield all generated coin to ' + $scope.detail.shieldAddress)
    }
  }

  $scope.shieldAllAction = function(){
    var arg = {}
    arg.privateAddr = $scope.detail.shieldAddress
    arg.shieldAddress = []
    var keys = Object.keys($scope.selectedList)
    keys.forEach(function(element) {
      if($scope.selectedList[element] == true)
      {
        arg.shieldAddress.push(element)
      }
    })
    electron.ipcRenderer.send('main-execute-multiple-shield', arg)
    //move to shield page
    showTab(ScreenType.SHIELD, false)
    $(window).scrollTop(0);
  }

  electron.ipcRenderer.on('child-update-address', function(event, msgData) {
    addrData = msgData.msg
    // writeLog(JSON.stringify(data))
    populateAddress(addrData, $scope.detail.hideZeroAddress)
  })

  electron.ipcRenderer.on('child-get-new-address', function(event, msgData) {
    var rtn = addAddressBook(newName, msgData.msg.result, serverData, currentCoin)
    book = rtn.book
    shouldGetWallet = true
    showAlert('#modalAddressNoti', 'New Address', msgData.msg.result)
  })

  electron.ipcRenderer.on('child-dump-priv-key', function(event, msgData) {
    var data = msgData.msg
    // writeLog(JSON.stringify(data))
    $timeout(function(){
      $scope.privKeyList[data.arg[1]] = data.value.result
      var keys = Object.keys($scope.selectedList)
      var privKeys = Object.keys($scope.privKeyList)

      var selectedCount = countSelected(keys)
      writeLog(selectedCount)
      writeLog(privKeys.length)
      if(selectedCount == privKeys.length)
      {
        $scope.detail.privatekeys = JSON.stringify($scope.privKeyList, null, 2)
        $scope.detail.enableGetPrivKey = true
        // $scope.detail.privatekeys = $scope.detail.privatekeys.replace('\r\n','\n').replace('\n', '')
        $('#privKeyModal').modal()
      }
      else
      {
        privKey()
      }
    })
  },0)

  electron.ipcRenderer.on('child-import-priv-key', function(event, msgData) {
    importKey(msgData)
  })

  electron.ipcRenderer.on('child-update-settings', function(event, msgData){
    $timeout(function(){
      if(msgData.msg[0] != null && msgData.msg[0] != undefined)
      {
        $scope.detail.hideZeroAddress = msgData.msg[0].hidezeroaddress
        $scope.detail.shieldAddress = msgData.msg[0].shieldaddress
        if($scope.detail.hideZeroAddress == false || $scope.detail.hideZeroAddress == undefined)
        {
          $scope.detail.hideZeroAddressText = "Hide Zero Balance"
        }
        else
        {
          $scope.detail.hideZeroAddressText = "Show Zero Balance"
        }
      }
      if(msgData.msg[1] != null && msgData.msg[1] != undefined)
      {
        $scope.detail.sapling = msgData.msg[2].sapling
      }
      $scope.detail.currentCoin = currentCoin
    },0)
  })
}])

app.controller('LoadingCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  var loading = true // set to true while we fetch the balances
  var serverUrl = "data.snowgem.org"
  var backupUrl = "rates.snowgem.org"
  var step = Steps.GET_COIN_LIST
  var verifyingKeyMD5 = "21e8b499aa84b5920ca0cea260074f34"
  var provingKeyMD5 = "af23e521697ed69d8b8a6b9c53e48300"
  var counter = 0
  var downloadTimer = undefined
  var walletStatusTimer = undefined
  $scope.detail = {}
  var req = undefined
  $scope.server = undefined
  $scope.port = undefined
  $scope.detail.disableProgressbar = true
  $scope.detail.linuxVersion = undefined
  $scope.detail.noiticeSelectUbuntu = true
  $scope.detail.popup = {}
  $scope.currentProcess = 'Preparing'
  $scope.visible = true
  $scope.oss = ["Ubuntu-16.04", "Ubuntu-18.04", "Others"]
  $scope.detail.background = "../../assets/images/xsg-loading5.png"
  var autoLauncher
  var currLoc = path.dirname (electron.remote.app.getPath ('exe'))

  if(process.platform == 'win32')
  {
      autoLauncher = new autoLaunch({
          name: 'ModernWallet',
          path: currLoc.replace('/', '\\') + "\\" + "ModernWallet.exe",
      });
  }
  else if(process.platform == 'linux')
  {
      autoLauncher = new autoLaunch({
          name: 'ModernWallet',
          path: currLoc + "/" + "ModernWallet",
      });
  }
  else if(process.platform == 'darwin')
  {
      autoLauncher = new autoLaunch({
          name: 'ModernWallet',
          path: "/Applications/ModernWallet.app",
      });
  }
  
  getPrice()
  
  $scope.restartAction = function(){
    if(serverData != undefined && serverData.daemon != undefined)
    {
      isRunning(serverData.daemon, function(status){
        var count = countOcurrences(status, serverData.daemon)
        if(count >=1)
        {
          stopWallet()
        }
      })
    }
    //check wallet status
    helpData = undefined
    setTimeout(restartFunction, 500)
  }

  function spawnMessage(type, text, btnText, title)
  {
    $timeout(function(){
      $scope.detail.title = title == undefined ? "Alert!!!" : title
      $scope.detail.text = text
      $scope.detail.btnText = btnText == undefined ? 'Apply' : btnText
      if(type == MsgType.ALERT)
      {
        $('#modalLoadingAlert').modal()
      }
      else if(type == MsgType.CONFIRMATION)
      {
        $('#modalLoadingNewVersion').modal()
      }
      else if(type == MsgType.UBUNTU_VERSION)
      {
        $('#modalUbuntuVersion').modal()
      }
      else if(type == MsgType.DAEMON_LOCATION)
      {
        $('#modalDaemonLocation').modal()
      }
      else if(type == MsgType.DEPENDENCIES)
      {
        $('#modalDependencies').modal()
      }
      else if(type == MsgType.SELECTCOIN)
      {
        $('#selectCoinAlert').modal()
      }
      else if(type == MsgType.AUTO_DOWNLOAD_DAEMON)
      {
        $('#autoDownloadDaemonModal').modal()
      }
      else if(type == MsgType.AUTO_DOWNLOAD_BLOCKCHAIN)
      {
        $('#autoDownloadBlockchainModal').modal()
      }
      else if(type == MsgType.LOADING_DAEMON)
      {
        $('#modalLoadingDaemon').modal()
      }
      else if(type == MsgType.CUSTOM_DATA)
      {
        $('#customDataDir').modal()
      }
      else if(type == MsgType.DATA_LOCATION)
      {
        $('#modalDataLocation').modal()
      }
      else if(type == MsgType.MASTERNODE_OPTION)
      {
        $('#masternodeOption').modal()
      }
      
      
    })
  }

  function showPopup(imgUrl, redirectUrl)
  {
    $scope.detail.popup.imgUrl = imgUrl
    $scope.detail.popup.redirectUrl = redirectUrl
    $('#modalPopup').modal()
  }

  function updateScope(step)
  {
    $timeout(function(){
      $scope.currentProcess = step
    },0)
  }

  function prepareFiles(stepLocal){
    switch(stepLocal) {
      case Steps.GET_COIN_LIST:
        updateScope('Getting coin list...')
        var temp = getCurrentCoin()
        if(temp != undefined)
        {
          currentCoin = temp
        }
        settings = readSettings(currentCoin)
        if(settings.background != undefined)
        {
          $scope.detail.background = settings.background
        }
        if(settings.bot != undefined && settings.apikey != undefined)
        {
          initBot(settings.bot, settings.apikey)
        }
        var arg = [settings, confData, serverData]
        ipc.send('main-update-settings', arg)
        getCoinList()
        break;
      case Steps.PREPARE:
        //@TODO get current coin

        writeLog(currentCoin)
        // writeLog(JSON.stringify(coinList.coins))
        $scope.detail.coins = coinList.coins
        var index = coinList.coins.findIndex(function(e){
          return e.name == currentCoin
        })
        if(currentCoin == undefined || index == -1)
        {
          //@TODO show select coin alert
          writeLog("Show alert")
          spawnMessage(MsgType.SELECTCOIN, '', '', 'Select Coin')
        }
        else
        {
          step = Steps.CHECK_JS
          prepareFiles(step)
        }
        break;
      case Steps.CHECK_JS:
        if(!isDevMode)
        {
          updateScope('Checking script update...')
          checkJsFile(coinList.jsmd5)
        }
        else
        {
          step = Steps.GET_DATA
          prepareFiles(step)
        }
        break
      case Steps.GET_DATA:
        updateScope('Getting server data...')
        getServerData()
        break
      case Steps.SHOW_POPUP:
        var noticeData = {}
        noticeData.popup = serverData.popup
        noticeData.banner = serverData.banner
        electron.ipcRenderer.send('main-notification-data', noticeData)
        if(false && checkNoticeDisplay(serverData) && serverData.popup != undefined && serverData.popup.length > 0)
        {
          updateScope('Displaying popup...')
          var random = Math.floor(Math.random() * serverData.popup.length)
          showPopup(serverData.popup[random].imgUrl, serverData.popup[random].redirectUrl)
        }
        else
        {
          step = Steps.START
          prepareFiles(step)
        }
        break
      
      case Steps.START:
        serverData.walletversion = coinList.version.walletversion
        serverData.detail = coinList.version.detail
        //install dependencies
        if(process.platform != 'win32')
        {
          var loc = getUserHome(serverData, settings) + (serverData.wallet == undefined ? "/wallet.dat" : ("/" + serverData.wallet))
          if(!fs.existsSync(loc))
          {
            var loc = installDependencies()
            var arg = [MsgType.DEPENDENCIES, 'Please run ' + loc + ' to install dependencies', 'Notice!!!']
            spawnMessage(MsgType.DEPENDENCIES, 'Please run ' + loc + ' to install dependencies', 'Notice!!!')
          }
          else
          {
            start()
          }
        }
        else
        {
          start()
        }
        break
      case Steps.CHECK_WALLET_VERSION:
        updateScope('Checking wallet version...')
        var shouldDownload = checkWalletVersion(serverData.walletversion)
        if(shouldDownload)
        {
          step = Steps.DOWNLOAD_WALLET_VERSION
        }
        else
        {
          step = Steps.CHECK_PARAMS
        }
        prepareFiles(step)
        break
      case Steps.DOWNLOAD_WALLET_VERSION:
        updateScope('Checking wallet version...')
        downloadWallet(serverData.walletversion, serverData.detail)
        break;
      case Steps.CHECK_PARAMS:
        updateScope('Checking params...')
        checkParams()
        break;
      case Steps.DOWNLOAD_PARAMS:
        updateScope('Downloading params...')
        downloadFile(serverData.paramsurl, getParamsHome(serverData), 'params')
        break;
      case Steps.CHECK_DAEMON:
        updateScope('Checking daemon...')
        //@TODO
        //check daemon from server or local
        //if server
        if(settings.autoupdatedaemon == true)
        {
          checkDaemon()
        }
        else if(settings.autoupdatedaemon == false)
        {
          step = Steps.CHECK_DATA_FOLDER
          prepareFiles(step)
        }
        else if(settings.autoupdatedaemon == undefined)
        {
          spawnMessage(MsgType.AUTO_DOWNLOAD_DAEMON, 'Do you want to download daemon file automatically?', '', ' ')
        }

        //if local

        break;
      case Steps.DOWNLOAD_DAEMON:
        updateScope('Downloading daemon...')
        isRunning('daemon', function(status){
          var count = countOcurrences(status, "daemon")
          if(count >=1)
          {
            stopWallet()
          }
        })
        if(process.platform == 'win32')
        {
          downloadFile(serverData.windowsdaemonurl, getWalletHome(false, currentCoin), 'daemon')
        }
        else if(process.platform == 'linux')
        {
          spawnMessage(MsgType.UBUNTU_VERSION, '', 'OK', 'Select a version from dropdown')
        }
        else
        {
          downloadFile(serverData.macdaemonurl, getWalletHome(false, currentCoin), 'daemon')
        }
        break;
      case Steps.CHECK_DATA_FOLDER:
        updateScope('Checkling data folder...')
        if(settings.datafolder == undefined)
        {
          spawnMessage(MsgType.CUSTOM_DATA, 'Do you want to use default data location?', '', ' ')
        }
        else
        {
          step = Steps.CHECK_BLOCKCHAIN
          prepareFiles(step)
        }
        break
      case Steps.CHECK_BLOCKCHAIN:
        updateScope('Checking blockchain...')
        var walletHome = getWalletHome(true)
        var file = walletHome + "/commands.txt";
        if(fs.existsSync(file))
        {
          var content = fs.readFileSync(file, 'utf8')
          fsextra.removeSync(file);
          args = args.concat(content.split('\n'));
        }
        var isExisted = checkBlockchain(serverData, args)
        if(!isExisted)
        {
          spawnMessage(MsgType.AUTO_DOWNLOAD_BLOCKCHAIN, 'Do you want to download blockchain automatically? (This action will speed up your syncing process)', '', ' ')
        }
        else
        {
          step = Steps.START_DAEMON
          prepareFiles(step)
        }
        break;
      case Steps.DOWNLOAD_BLOCKCHAIN:
        //check txindex
        updateScope('Downloading blockchain...')

        var homeDir = getUserHome(serverData, settings)
        if(fs.existsSync(homeDir + "/blocks"))
        {
          fsextra.removeSync(homeDir + "/blocks")
        }
        if(fs.existsSync(homeDir + "/chainstate"))
        {
          fsextra.removeSync(homeDir + "/chainstate")
        }
        if(fs.existsSync(homeDir + "/sporks"))
        {
          fsextra.removeSync(homeDir + "/sporks")
        }
        if(confData.txindex == 1)
        {
          if(serverData.blockchain != undefined && serverData.blockchain.index != undefined)
          {
            downloadBlockChain(serverData.blockchain.index, getUserHome(serverData, settings), 'blockchain.zip')
          }
        }
        else
        {
          if(serverData.blockchain != undefined && serverData.blockchain.noindex != undefined)
          {
            downloadBlockChain(serverData.blockchain.noindex, getUserHome(serverData, settings), 'blockchain.zip')
          }
        }
        //download file
        break;
      case Steps.START_DAEMON:
        //@TODO check if reindex or other agruments
        updateScope('Starting daemon...')
        if(settings.datafolder != undefined)
        {
          args.push('-datadir=' + settings.datafolder)
        }
        arg = [settings, confData, serverData]
        ipc.send('main-update-settings', arg)
        startWallet(args)
        break;
      case Steps.OPENING_WALLET:
        setTimeout(walletStatusTimerFunction, 2000)
        break;
      case Steps.FINISH:
        updateScope('Finishing...')
        finishLoading(currentCoin, serverData)
        break;
      case Steps.END:
        writeLog("End\n\n\n")
        clearInterval(walletStatusTimer)
        var arg = []
        ipc.send('main-self-close', arg)
        break;
    }
  }

  function getCoinList(){
    var coinlistPath = '/modernwallet/coinlist.json'
    if(isDevMode || betaTest)
    {
      coinlistPath = '/modernwallet/coinlist_beta.json'
    }

    var request = require('request');
    request('https://' + serverUrl + coinlistPath, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      if(response == undefined || response.statusCode != 200)
      {
        request('https://' + backupUrl + coinlistPath, function (error, response, body) {
          console.log('error:', error); // Print the error if one occurred
          if(response == undefined || response.statusCode != 200){
            request('http://' + serverUrl + coinlistPath, function (error, response, body) {
              console.log('error:', error); // Print the error if one occurred
              if(response == undefined || response.statusCode != 200){
                spawnMessage(MsgType.ALERT, "Could not get data from server")
              }
              else
              {
                $scope.server = serverUrl
                $scope.port = 80
                coinList = JSON.parse(String(body))
                step = Steps.PREPARE
                prepareFiles(step)
              }
            })
          }
          else
          {
            $scope.server = backupUrl
            $scope.port = 443
            coinList = JSON.parse(String(body))
            step = Steps.PREPARE
            prepareFiles(step)
          }
        })
      }
      else
      {
        $scope.server = serverUrl
        $scope.port = 443
        coinList = JSON.parse(String(body))
        step = Steps.PREPARE
        prepareFiles(step)
      }
    });
  }

  function getServerData(){
    var coinData = '/modernwallet/' + (currentCoin == undefined ? 'SnowGem' : currentCoin) + '/version.txt'
    if(isDevMode || betaTest)
    {
      coinData = '/modernwallet/beta/' + (currentCoin == undefined ? 'SnowGem' : currentCoin) + '/version.txt'
    }
    var request = require('request');
    if($scope.port == 443)
    {
      request('https://' + $scope.server + coinData, function (error, response, body) {
        if(response == undefined){
          spawnMessage(MsgType.ALERT, "Could not get data from server")
        }
        else
        {
          serverData = JSON.parse(String(body))
          step = Steps.SHOW_POPUP
          prepareFiles(step)
        }
      })
    }
    else if($scope.port == 80)
    {
      request('http://' + $scope.server + coinData, function (error, response, body) {
        if(response == undefined){
          spawnMessage(MsgType.ALERT, "Could not get data from server")
        }
        else
        {
          serverData = JSON.parse(String(body))
          step = Steps.SHOW_POPUP
          prepareFiles(step)
        }
      })
    }
  }

  function checkWalletVersion(ver) {
    if(appVersion < ver)
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  function checkJsFile(md5) {
    var jsFolder = "resources/app/"
    var jsFolder2 = "resources/app/src/"
    var jsFile = jsFolder2 + "app.js"
    if (process.platform == 'darwin'){
      jsFolder = __dirname
      jsFolder2 = __dirname
      jsFile = jsFolder2 + "/app.js"
    }
    if(!fs.existsSync(jsFolder))
    {
      fs.mkdirSync(jsFolder);
      fs.mkdirSync(jsFolder2);
      downloadJsFile(jsFile)
    }
    else if(!fs.existsSync(jsFolder2))
    {
      fs.mkdirSync(jsFolder2);
      downloadJsFile(jsFile)
    }
    else if(!fs.existsSync(jsFile))
    {
      downloadJsFile(jsFile)
    }
    else
    {
      md5File(jsFile, function(err, hash) {
        if (err) {
          writeLog("check MD5 error")
        }
        else
        {

          if(hash.toLowerCase() != md5.toLowerCase())
          {
            downloadJsFile(jsFile)
          }
          else
          {
            step = Steps.GET_DATA
            prepareFiles(step)
          }
        }
      })
    }

    function downloadJsFile(jsFile)
    {
      updateScope('Downloading new files...')
      url = coinList.jsurl;
      downloadFileInside(url, jsFile)
      function downloadFileInside(file_url , targetPath){
        req = request({
          method: 'GET',
          uri: file_url
        });
  
        var out = fs.createWriteStream(targetPath);
        var stream = req.pipe(out);
      
        //finish downloading
        stream.on('finish', function(){
          var arg = []
          electron.ipcRenderer.send('main-reload', arg)
        });
  
        req.on('response', function ( data ) {
          // Change the total bytes value to get progress later.
        });
  
        req.on('data', function(chunk) {
          // Update the received bytes
        });
  
        req.on('error', function (err){
        });
      }
    }
  }

  // function checkDaemon() {
  //   var version = getToolVersion(getWalletHome(false, currentCoin))
  //   try
  //   {
  //     var currVer = JSON.parse(version)
  //     if(currVer == null || currVer.daemonversion < ver)
  //     {
  //       return true;
  //     }
  //     else
  //     {
  //       return false;
  //     }
  //   }
  //   catch(err) {
  //     writeLog(err);
  //   }
  // }

  function walletStatusTimerFunction(){
    // writeLog(helpData)
    checkWallet()
    if(helpData != null && helpData != undefined)
    {
      if (helpData.result != null)
      {
        writeLog("go to finish")
        step = Steps.FINISH
        prepareFiles(step)
      }
      else
      {
        if(step != Steps.END)
        {
          setTimeout(walletStatusTimerFunction, 2000)
        }
        updateScope(helpData.error.message)
      }
    }
    else
    {
      if(step != Steps.END)
      {
        setTimeout(walletStatusTimerFunction, 2000)
      }
    }
  }

  function finishLoading(coin, serverData)
  {
    writeLog("wallet is started")
    //clearInterval(walletStatusTimer)

    var arg = [coin, serverData]
    electron.ipcRenderer.send('main-execute-timer', arg)
    if(settings.autoshield)
    {
      electron.ipcRenderer.send('main-execute-shield-all', settings)
    }
  }

  $scope.closePopup = function() {
    step = Steps.START
    prepareFiles(step)
  }

  function downloadFile(url, saveFolder, name) {
    var finishStream = false
    url = url.replace("https:\\", "https://");
    writeLog('downloading ' + url)
    writeLog(saveFolder)
    if(!fs.existsSync(saveFolder))
    {
      fs.mkdirSync(saveFolder);
    }
    var saveFile = saveFolder + "/" + name + ".zip";
    downloadFileInside(url, saveFile)
    writeLog(saveFile);
    function downloadFileInside(file_url , targetPath){
      // Save variable to know progress
      var received_bytes = 0;
      var total_bytes =   0;
      $timeout(function(){
        $scope.detail.disableProgressbar = false
      },0)
      req = request({
        method: 'GET',
        uri: file_url
      });

      var out = fs.createWriteStream(targetPath);
      var stream = req.pipe(out);
    
      //finish downloading
      stream.on('finish', function(){
        //enable flag
        finishStream = true;
        $timeout(function(){
          $scope.detail.disableProgressbar = true
        },0)
        setTimeout(function(){
          downloadTimerFunction()
        }, 3000);
      });

      req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length' ]);
      });

      req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        showProgress(received_bytes, total_bytes);
      });

      req.on('error', function (err){
        fs.unlink(saveFile);
        $timeout(function(){
          $scope.detail.disableProgressbar = true
        },0)

        spawnMessage(MsgType.ALERT, "Downloading error, restarting wallet")
      });

      function downloadTimerFunction(){
        updateScope('Extracting file')
        $timeout(function(){
          $scope.detail.disableProgressbar = false
          $scope.detail.progress = 0
          $scope.detail.width = '0%'

          //extracting text
          if(received_bytes ==  total_bytes)
          {
            var unzipper = new DecompressZip(saveFile);

            // Add the error event listener
            unzipper.on('error', function (err) {
              $timeout(function(){
                fs.unlinkSync(saveFile);
                if(step == Steps.DOWNLOAD_PARAMS)
                {
                  spawnMessage(MsgType.ALERT, "Download param files error, please restart wallet")
                }
                else if(step == Steps.DOWNLOAD_DAEMON)
                {
                  spawnMessage(MsgType.ALERT, "Download new daemon files error, please restart wallet")
                }
                else if(step == Steps.DOWNLOAD_BLOCKCHAIN)
                {
                  spawnMessage(MsgType.ALERT, "Download blockchain error, please restart wallet")
                }
                $scope.detail.disableProgressbar = true
              },0)
            });

            // Notify when everything is extracted
            unzipper.on('extract', function (log) {
              $timeout(function(){
                $scope.detail.disableProgressbar = true
                fs.unlinkSync(saveFile)
                if(step == Steps.DOWNLOAD_BLOCKCHAIN)
                {
                  step = Steps.START_DAEMON
                  setTimeout(prepareFiles, 2000, step)
                }
                else
                {
                  step = Steps.CHECK_DAEMON
                  prepareFiles(step)
                }
              },0)
            });

            // Notify "progress" of the decompressed files
            unzipper.on('progress', function (fileIndex, fileCount) {
              $timeout(function(){
                var percentage = (parseFloat(fileIndex + 1) / fileCount * 100).toFixed(2)
                updateScope('Extracting file (' + percentage + '%)')
                $scope.detail.progress = percentage
                $scope.detail.width = percentage + '%'
              },0)
            });

            // Start extraction of the content
            unzipper.extract({
              path: saveFolder
            });
          }
          else
          {
            $scope.detail.disableProgressbar = true
          }
        },0)
      }

      function showProgress(received, total){
        var percentage = (received * 100) / total;
        $timeout(function(){
          updateScope('Downloading params (' + (received / 1024 / 1024).toFixed(2) + "MB/ " + (total / 1024 / 1024).toFixed(2) + "MB)")
          $scope.detail.progress = percentage
          $scope.detail.width = percentage.toFixed(2) + '%'
        },0)
      }
    }
  }

  function downloadBlockChain(files, saveFolder, outputFile) {
    var finishStream = false
    if(files.length > 0)
    {
      filesCopy = files.slice(0)
      url = filesCopy[0].replace("https:\\", "https://");
      filesCopy.splice(0, 1)
      //https://github.com/Snowgem/Snowgem/releases/download/3000450-20181208/snowgem-linux-3000450-20181208.zip
      writeLog('downloading ' + url)
      writeLog(saveFolder)
      var splits = url.split('/')
      name = splits[splits.length - 1]
      if(!fs.existsSync(saveFolder))
      {
        fs.mkdirSync(saveFolder);
      }
      var saveFile = saveFolder + "/" + name;
      downloadFileInside(url, saveFile, name)
      writeLog(saveFile);
      function downloadFileInside(file_url , targetPath, name){
        // Save variable to know progress
        var received_bytes = 0;
        var total_bytes =   0;
        $timeout(function(){
          $scope.detail.disableProgressbar = false
        },0)
        req = request({
          method: 'GET',
          uri: file_url
        });
  
        var out = fs.createWriteStream(targetPath);
        var stream = req.pipe(out);
      
        //finish downloading
        stream.on('finish', function(){
          //enable flag
          if(filesCopy.length == 0)
          {
            finishStream = true;
            $timeout(function(){
              $scope.detail.disableProgressbar = true
            },0)
            setTimeout(function(){
              downloadTimerFunction()
            }, 3000);
          }
          else
          {
            url = filesCopy[0].replace("https:\\", "https://");
            filesCopy.splice(0, 1)
            writeLog('downloading ' + url)
            writeLog(saveFolder)
            var splits = url.split('/')
            name = splits[splits.length - 1]
            var saveFile = saveFolder + "/" + name;
            downloadFileInside(url, saveFile, name)
          }
        });
  
        req.on('response', function ( data ) {
          // Change the total bytes value to get progress later.
          total_bytes = parseInt(data.headers['content-length' ]);
        });
  
        req.on('data', function(chunk) {
          // Update the received bytes
          received_bytes += chunk.length;
  
          showProgress(received_bytes, total_bytes, name);
        });
  
        req.on('error', function (err){
          $timeout(function(){
            $scope.detail.disableProgressbar = true
            files.forEach(function(element){
              fs.unlinkSync(element);
            });
          },0)
  
          spawnMessage(MsgType.ALERT, "Downloading blockchain error, restarting wallet")
        });
      }

      function downloadTimerFunction(){

        updateScope('Joining files')
        var splitFile = require('split-file');
        var saveFile = saveFolder + '/' + outputFile
        var filenName = []
        files.forEach(function(element){
          var splits = element.split('/')
          filenName.push(saveFolder + '/' + splits[splits.length - 1])
        });
        splitFile.mergeFiles(filenName, saveFile)
        .then(function(){
          updateScope('Extracting file')
          $timeout(function(){
            $scope.detail.disableProgressbar = false
            $scope.detail.progress = 0
            $scope.detail.width = '0%'
  
            //extracting text
            {
              var unzipper = new DecompressZip(saveFile);
  
              // Add the error event listener
              unzipper.on('error', function (err) {
                $timeout(function(){
                  fs.unlinkSync(saveFile);
                  files.forEach(function(element){
                    fs.unlinkSync(element);
                  });
                  spawnMessage(MsgType.ALERT, "Download blockchain error, please restart wallet")
                  $scope.detail.disableProgressbar = true
                },0)
              });
  
              // Notify when everything is extracted
              unzipper.on('extract', function (log) {
                $timeout(function(){
                  $scope.detail.disableProgressbar = true
                  fs.unlinkSync(saveFile)
                  if(step == Steps.DOWNLOAD_BLOCKCHAIN)
                  {
                    step = Steps.START_DAEMON
                    setTimeout(prepareFiles, 2000, step)
                  }
                },0)
              });
  
              // Notify "progress" of the decompressed files
              unzipper.on('progress', function (fileIndex, fileCount) {
                $timeout(function(){
                  var percentage = (parseFloat(fileIndex + 1) / fileCount * 100).toFixed(2)
                  updateScope('Extracting file (' + percentage + '%)')
                  $scope.detail.progress = percentage
                  $scope.detail.width = percentage + '%'
                },0)
              });
  
              // Start extraction of the content
              unzipper.extract({
                path: saveFolder
              });
            }
          },0)
        })
        .catch(function(err){
          console.log('Error: ', err);
        });
      }

      function showProgress(received, total, name){
        var percentage = (received * 100) / total;
        $timeout(function(){
          updateScope('Downloading ' + name + ' (' + (received / 1024 / 1024).toFixed(2) + "MB/ " + (total / 1024 / 1024).toFixed(2) + "MB)")
          $scope.detail.progress = percentage
          $scope.detail.width = percentage.toFixed(2) + '%'
        },0)
      }
    }
    else
    {
      step = Steps.START_DAEMON
      setTimeout(prepareFiles, 2000, step)
    }
  }

  function downloadWallet(ver, detail)
  {
    spawnMessage(MsgType.CONFIRMATION, detail == undefined ? "Do you want to download?" : detail, "Download", "Version " + ver + " is availabled")
  }

  function checkParams(){
    writeLog("check params")
    var paramsHome = getParamsHome(serverData)
    var paramFiles = serverData.paramfiles
    if(paramFiles != null && paramFiles != undefined)
    {
      var keys = Object.keys(paramFiles)
      var existed = true
      keys.some(function(element){
        if(!fs.existsSync(paramsHome + '/' + element))
        {
          existed = false
          return
        }
      })

      if(!existed)
      {
        writeLog("file not existed")
        step = Steps.DOWNLOAD_PARAMS
        prepareFiles(step)
      }
      else
      {
        var count = 0
        keys.some(function(element){
          md5File(paramsHome + '/' + element, function(err, hash) {
            if (err) {
              writeLog("check MD5 error")
            }
            else
            {
              writeLog("hash = " + hash)
              writeLog("server hash = " + paramFiles[element])
              if(hash.toLowerCase() != paramFiles[element].toLowerCase())
              {
                writeLog("key not correct")
                shouldDownload = true
                step = Steps.DOWNLOAD_PARAMS
                prepareFiles(step)
                return
              }
              count++
              if(count == keys.length)
              {
                writeLog("params are ok")
                step = Steps.CHECK_DAEMON
                prepareFiles(step)
              }
            }
          })
        })
      }
    }
    else
    {
      step = Steps.CHECK_DAEMON
      prepareFiles(step)
    }
  }

  function checkDaemon(){
    writeLog("check daemon")

    if(!fs.existsSync(settings.daemon))
    {
      writeLog("file not existed")
      step = Steps.DOWNLOAD_DAEMON
      prepareFiles(step)
    }
    else
    {
      md5File(settings.daemon, function(err, hash) {
        if (err) {
          writeLog("check MD5 error")
        }
        else
        {
          var checksum = ""

          if (process.platform == 'win32') {
            checksum = serverData.checksum['windowsdaemon']
          } else if (process.platform == 'linux') {
            if(settings.linuxversion == 'Ubuntu-16.04')
            {
              checksum = serverData.checksum['linuxdaemon']
            }
            else if(settings.linuxversion == 'Ubuntu-18.04')
            {
              checksum = serverData.checksum['linuxdaemon_18']
            }
          } else if (process.platform == 'darwin'){
            checksum = serverData.checksum['macdaemon']
          }

          writeLog("daemon hash = " + hash)
          writeLog("checksum = " + checksum)

          if(checksum == undefined || hash.toLowerCase() != checksum.toLowerCase())
          {
            writeLog("daemon checksum is not correct")
            step = Steps.DOWNLOAD_DAEMON
            prepareFiles(step)
          }
          else
          {
            step = Steps.CHECK_DATA_FOLDER
            prepareFiles(step)
          }
        }
      })
    }
  }

  prepareFiles(step)

  electron.ipcRenderer.on('child-loading-screen', function(event, msgData) {
    var data = msgData.msg
    writeLog(data)
    if(data.status == true)
    {
      step = Steps.OPENING_WALLET
      prepareFiles(step)
    }
    else
    {
      step = Steps.END
      prepareFiles(step)
    }
  })

  electron.ipcRenderer.on('child-stop-daemon', function(event, msgData) {
    stopWallet()
  })

  electron.ipcRenderer.on('child-spawn-error', function(event, msgData) {
    spawnMessage(MsgType.LOADING_DAEMON, msgData.msg[0])
  })

  electron.ipcRenderer.on('child-process-data', function(event, msgData) {
    var data = msgData.msg
    writeLog(data.key)
    if(data.key == 'getalldata')
    {
      getalldata = data
      electron.ipcRenderer.send('main-summary-data', getalldata)
    }
    else if(data.key == 'help')
    {
      helpData = data.value
    }
    else if(data.key == 'getinfo')
    {
      getinfoData = data.value
      //update network height
    }
    else if(data.key == 'z_sendmany')
    {
      z_sendmanyData = data.value
      electron.ipcRenderer.send('main-send-coin', z_sendmanyData)
    }
    else if(data.key == 'z_getoperationstatus')
    {
      z_getoperationstatusData = data.value
      var arg = data.arg
      if(arg[2] == SendType.NORMAL)
      {
        electron.ipcRenderer.send('main-check-transaction', z_getoperationstatusData)
      }
      else if(arg[2] == SendType.SHIELD)
      {
        electron.ipcRenderer.send('main-check-transaction-shield', z_getoperationstatusData)
      }
    }
    else if(data.key == 'validateaddress')
    {
      var arg = []
      validateaddressData = data.value
      arg.push(data.value)
      arg.push(data.arg)
      electron.ipcRenderer.send('main-verify-address', arg)
    }
    else if(data.key == 'z_validateaddress')
    {
      var arg = []
      validateaddressData = data.value
      arg.push(data.value)
      arg.push(data.arg)
      electron.ipcRenderer.send('main-verify-zaddress', arg)
    }
    else if(data.key == 'z_shieldcoinbase')
    {
      z_shieldcoinbaseData = data
      electron.ipcRenderer.send('main-shield-coin', z_shieldcoinbaseData)
    }
    else if(data.key == 'masternode')
    {
      if(data.arg['1'] == 'list')
      {
        masternodelistData = data.value
        electron.ipcRenderer.send('main-masternode-list', masternodelistData)
      }
      else  if(data.arg['1'] == 'outputs')
      {
        masternodeoutputsData = data.value
        electron.ipcRenderer.send('main-masternode-outputs', masternodeoutputsData)
      }
      else  if(data.arg['1'] == 'genkey')
      {
        masternodegenkeyData = data.value
        electron.ipcRenderer.send('main-masternode-genkey', masternodegenkeyData)
      }
    }
    else if(data.key == 'startmasternode')
    {
      if(data.arg['1'] == 'alias')
      {
        
        startmasternodealiasData = data.value
        electron.ipcRenderer.send('main-start-masternode', startmasternodealiasData)
      }
      else  if(data.arg['1'] == 'many')
      {
        startmasternodemanyData = data.value
      }
    }
    else if(data.key == 'dumpprivkey' || data.key == 'z_exportkey')
    {
      dumpprivkeyData = data
      electron.ipcRenderer.send('main-dump-priv-key', dumpprivkeyData)
    }
    else if(data.key == 'importprivkey' || data.key == 'z_importkey')
    {
      importprivkeyData = data
      electron.ipcRenderer.send('main-import-priv-key', importprivkeyData)
    }
    else if(data.key == 'startalias')
    {
      startaliasData = data.value
      electron.ipcRenderer.send('main-start-alias', startaliasData)
    }
    else if(data.key == 'getpeerinfo')
    {
      getPeerInfoData = data.value
      electron.ipcRenderer.send('main-get-peer-info', getPeerInfoData)
    }
    else if(data.key == 'getdebug')
    {
      getDebugData = data.value
      electron.ipcRenderer.send('main-get-debug', getDebugData)
    }
    else if(data.key == 'getnewaddress' || data.key == 'z_getnewaddress')
    {
      getNewAddressData = data.value
      electron.ipcRenderer.send('main-get-new-address', getNewAddressData)
    }
    else if(data.key == 'stop')
    {
      //do nothing
    }
    else
    {
      writeLog('not supported ' + data.key)
    }
  })

  $scope.autoDownload = function(){
    settings.autoupdatedaemon = true
    settings.daemon = getWalletHome(false, currentCoin) + '/' + serverData.daemon
    if (process.platform == 'win32') {
      settings.daemon += ".exe"
    }
    saveSettings(settings, currentCoin)
    checkDaemon()
  }

  $scope.noAutoDownload = function(){
    spawnMessage(MsgType.DAEMON_LOCATION, '', '', 'Select Binary Files')
  }

  $scope.autoDownloadBlockchain = function(){
    var index = args.findIndex(function(e){return e == '-reindex'})
    args.splice(index, 1)
    step = Steps.DOWNLOAD_BLOCKCHAIN
    prepareFiles(step)
  }

  $scope.noAutoDownloadBlockchain = function(){
    step = Steps.START_DAEMON
    prepareFiles(step)
  }
  
  $scope.selectLinux = function(version){
    if(version == undefined)
    {
      $scope.detail.noiticeSelectUbuntu = false
    }
    else
    {
      $('#modalUbuntuVersion').modal('hide');
      if(serverData[version] != undefined)
      {
        settings.linuxversion = version
        saveSettings(settings)
        downloadFile(serverData[version], getWalletHome(false, currentCoin), 'daemon')
      }
      else
      {
        //@TODO show select daemon location dialog
        spawnMessage(MsgType.DAEMON_LOCATION, '', '', 'Select Binary Files')
      }
    }
  }

  $scope.daemonAction = function(){
    //stop wallet
    var dataSend = {}
    if(!$scope.detail.text.includes('Cannot obtain a lock on data directory'))
    {
      dataSend['status'] = false
      electron.ipcRenderer.send('main-loading-screen', dataSend)
    }
    else
    {
      dataSend['status'] = true
      electron.ipcRenderer.send('main-loading-screen', dataSend)
    }
  }

  function restartFunction(){
    // writeLog(helpData)
    checkWallet()
    if(helpData != null  && helpData != undefined)
    {
      if (helpData.result == null)
      {
        //refresh wallet
        var arg = []
        electron.ipcRenderer.send('main-reload', arg)
      }
      else
      {
        setTimeout(restartFunction, 500)
      }
    }
    else
    {
      setTimeout(restartFunction, 500)
    }
  }

  function start(){
    writeLog('not running')
    updateScope('Starting...')
    confData = readConfig(serverData)
    if(confData.rpcuser == undefined)
    {
      confData['rpcuser'] = makeRandom(30)
      confData['rpcpassword'] = makeRandom(30)
      spawnMessage(MsgType.MASTERNODE_OPTION, 'Do you have any plan to setup masternodes on this wallet?', '', ' ')
    }
    else
    {
      runDaemon()
    }
    
  }

  function runDaemon() {
    settings = readSettings(currentCoin)
    if(settings.autoupdatedaemon)
    {
      settings.daemon = getWalletHome(false, currentCoin) + '/' + serverData.daemon
      if (process.platform == 'win32') {
        settings.daemon += ".exe"
      }
    }

    if(settings.autostart)
    {
      autoLauncher.enable()
    }
    else
    {
      autoLauncher.disable()
    }

    if(settings.enablelog == undefined)
    {
      settings.enablelog = true
    }

    if(settings.transactionschart == undefined)
    {
      settings.transactionschart = true
    }

    if(settings.background != undefined)
    {
      $scope.detail.background = settings.background
    }
    var arg = [settings, confData, serverData]
    ipc.send('main-update-settings', arg)

    book = readAddressBook(true, serverData, currentCoin)
    arg = []
    step = Steps.CHECK_WALLET_VERSION
    prepareFiles(step)
  }

  $scope.dependenciesAction = function(){
    start()
  }

  electron.ipcRenderer.on('main-dependencies', function(){
    start()
  })

  $scope.btnAction = function(){
    writeLog('go to download page')
    var shell = electron.shell
    shell.openExternal(serverData.walleturl)
    //close wallet
    var arg = []
    ipc.send('main-self-close', arg)
  }

  $scope.cancelAction = function(){
    step = Steps.CHECK_PARAMS
    prepareFiles(step)
  }

  $scope.openDaemon = function(){
    $scope.detail.disableSelectDaemon = true
    var dialogOptions;
    if(process.platform == 'win32')
    {
      dialogOptions= {
        filters: [
          { name: "Exe Files", extensions: ["exe"] },
        ],
        properties: ["openFile"]
      }
    }
    else if(process.platform == 'linux' || process.platform == 'darwin')
    {
      dialogOptions= {
        properties: ["openFile"]
      }
    }
    dialog.showOpenDialog(dialogOptions, function (fileNames) {
      $timeout(function(){
        $scope.detail.disableSelectDaemon = false
        if(fileNames === undefined){
          writeLog("No file selected");
        }else{
          document.getElementById("daemon-file").value = $scope.detail.daemonLocation = fileNames[0];
        }
      },0)
    })
  }


  $scope.openCli = function(){
    var dialogOptions;
    if(process.platform == 'win32')
    {
      dialogOptions= {
        filters: [
          { name: "Exe Files", extensions: ["exe"] },
        ],
        properties: ["openFile"]
      }
    }
    else if(process.platform == 'linux' || process.platform == 'darwin')
    {
      dialogOptions= {
        properties: ["openFile"]
      }
    }
    dialog.showOpenDialog(dialogOptions, function (fileNames) {
      if(fileNames === undefined){
        writeLog("No file selected");
      }else{
        document.getElementById("cli-file").value = $scope.detail.cliLocation = fileNames[0];
      }
    })
  }

  $scope.applyLocationAction = function(){
    //@TODO load daemon from new location
    if($scope.detail.daemonLocation == '' || $scope.detail.daemonLocation == undefined)
    {
      spawnMessage(MsgType.ALERT, "Daemon location cannot be empty")
    }
    else
    {
      var data = readSettings(currentCoin)
      data['daemon'] = $scope.detail.daemonLocation.replace('\\', '/')
      settings.autoupdatedaemon = false
      data['autoupdatedaemon'] = false
      writeLog(JSON.stringify(data))
      saveSettings(data, currentCoin)
      var arg = []
      electron.ipcRenderer.send('main-reload', arg)
    }
  }
  
  $scope.cancelLocationAction = function(){
    spawnMessage(MsgType.AUTO_DOWNLOAD_DAEMON, 'Do you want to download daemon file automatically?', '', ' ')
  }

  $scope.selectCoin = function(coin){
    currentCoin = coin
    var currData = {}
    currData["coinname"] = currentCoin
    saveCurrentCoin(JSON.stringify(currData), currentCoin)

    step = Steps.GET_COIN_LIST
    prepareFiles(step)
  }

  $scope.noCustomData = function(){
    settings.datafolder = getUserHome(serverData, undefined)
    saveSettings(settings, currentCoin)
    step = Steps.CHECK_BLOCKCHAIN
    prepareFiles(step)
  }

  $scope.customData = function(){
    spawnMessage(MsgType.DATA_LOCATION, '', '', 'Select Data Directory')
  }

  $scope.openDataDir = function(){
    $scope.detail.disableSelectDirectory = true
    var dialogOptions = {
      properties: ["openDirectory"]
    }
    dialog.showOpenDialog(dialogOptions, function (folder) {
      $timeout(function(){
        $scope.detail.disableSelectDirectory = false
        if(folder === undefined){
          writeLog("No folder selected");
        }else{
          document.getElementById("data-dir").value = $scope.detail.dataLocation = folder[0];
        }
      }, 0)
    })
  }

  $scope.applyCustomDataAction = function(){
    if($scope.detail.dataLocation == '' || $scope.detail.dataLocation == undefined)
    {
      spawnMessage(MsgType.ALERT, "Data folder cannot be empty")
    }
    else
    {
      var data = readSettings(currentCoin)
      data['datafolder'] = $scope.detail.dataLocation.replace('\\', '/')
      writeLog(JSON.stringify(data))
      saveSettings(data, currentCoin)
      var arg = []
      electron.ipcRenderer.send('main-reload', arg)
    }
  }

  $scope.canceCustomDataAction = function(){
    spawnMessage(MsgType.CUSTOM_DATA, 'Do you want to use default data location?', '', ' ')
  }

  $scope.indexData = function() {
    confData['txindex'] = 1
    writeConfig(confData)
    runDaemon()
  }

  $scope.noindexData = function() {
    confData['txindex'] = 0
    writeConfig(confData)
    runDaemon()
  }
}]);

app.controller('MasternodesCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.localMNs = []
  $scope.networkMNs = []
  $scope.selectedList = {}
  $scope.selectedListClone = {}
  $scope.detail = {}
  $scope.detail.current = {}
  $scope.visible = false
  $scope.detail.disableActions = true

  function spawnMessage(type, text, title)
  {
    var arg = [ScreenType.MASTERNODES, true]
    electron.ipcRenderer.send('main-show-screen', arg)
    $timeout(function(){
      $scope.detail.title = title == undefined ? "Alert!!!" : title
      $scope.detail.text = text
      if(type == MsgType.ALERT)
      {
        $('#modalMasternodesAlert').modal()
      }
      else if(type == MsgType.CONFIRMATION)
      {
        $('#modalMasternodesConfirmation').modal()
      }
      else if(type == MsgType.DELETE)
      {
        $('#modalMasternodesDelete').modal()
      }
      else if(type == MsgType.EDITMN)
      {
        $('#modalMasternodesEdit').modal()
      }
    })
  }

  String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
  };

  function populateLocalMN()
  {
    writeLog('populateLocalMN')
    var data = getMasternodes()
    $scope.localMNs = []

    if(data != undefined && data != null)
    {
      data = data.replace('\r\n', '\n')
      var split = data.split('\n')
      split = split.filter(function(v){return !v.isEmpty()})

      //@TODO update masternode local list
      var count = 1
      split.forEach(function(element) {
        var temp = {}
        if(!element.startsWith('# '))
        {
          var split2 = element.split(' ')
          split2 = split2.filter(function(v){return v!=''})
          if(split2.length >= 5)
          {
            temp['no'] = count
            if(split2[0].startsWith('#'))
            {
              temp['status'] = "No"
              temp['alias'] = split2[0].split('#')[1]
            }
            else
            {
              temp['status'] = "Yes"
              temp['alias'] = split2[0]
            }
            var split3 = split2[1].split(':')
            split3.splice(split3.length - 1, 1)
            temp['ip'] = split3.join(":")
            temp['privkey'] = split2[2]
            temp['txhash'] = split2[3]
            temp['txhashidx'] = split2[4]
            temp['rank'] = '-'
            temp['activetime'] = '-'
            temp['lastseen'] = '-'
            //temp['key'] = temp['txhashidx']
            count += 1
          }

          var index = $scope.localMNs.findIndex(function(e){return e.txhash === temp.txhash})
          if(index == -1)
          {
            $scope.localMNs.push(temp)
          }
          else
          {
            if($scope.localMNs[index].alias != temp.alias)
            {
              $scope.localMNs[index].alias = temp.alias
              $scope.localMNs[index].status = temp.status
            }
          }
        }
      })
      $scope.localMNs.sort(function(a,b){return a.alias > b.alias})
      localMNs = JSON.parse(angular.toJson($scope.localMNs))
    }
  }
  
  function countSelected(keys){
    var selectedCount = 0
    keys.forEach(function(element) {
      if($scope.selectedList[element] == true)
      {
        selectedCount += 1
      }
    })
    return selectedCount
  }

  function populateNetworkMN(data)
  {
    writeLog('total MNs: ' + data.result.length)
    $scope.networkMNs = []
    data.result.forEach(function(element) {
      var temp = {}
      temp['rank'] = element.rank
      temp['ip'] = element.ip
      temp['txhash'] = element.txhash
      temp['status'] = element.status
      temp['addr'] = element.addr
      temp['version'] = element.version
      temp['activetime'] = secondsToString(element.activetime)
      temp['lastseen'] = timeConverter(element.lastseen)
      temp['value'] = element

      $scope.networkMNs.push(temp)
    })
    
    if($scope.networkMNs.length == 0)
    {
      setTimeout(getMasternodeList, 5000);
    }
    //get masternode list after 60 sec
    else
    {
      $scope.localMNs.forEach(function(element) {
        var index = $scope.networkMNs.findIndex(function(e){return e.txhash === element.txhash})

        if(index > -1)
        {
          element.rank = $scope.networkMNs[index].rank
          element.activetime = $scope.networkMNs[index].activetime
          element.lastseen = $scope.networkMNs[index].lastseen
        }
      })
      setTimeout(getMasternodeList, 60000);
    }
  }

  $scope.select = function(hash, status)
  {
    //$scope.selectedList[hash] = status
    var keys = Object.keys($scope.selectedList)
    var selectedCount = countSelected(keys)
    if(selectedCount > 0)
    {
      $scope.detail.disableActions = false
      if(selectedCount > 1)
      {
        $scope.detail.disableEdit = true
      }
      else
      {
        $scope.detail.disableEdit = false
      }
    }
    else
    {
      $scope.detail.disableActions = true
    }
  }

  $scope.editMasternode = function(isDisabled){
    writeLog("edit masternode")
    if(!isDisabled)
    {
      var keys = Object.keys($scope.selectedList)
      var index = keys.findIndex(function(e){return $scope.selectedList[e] == true})
      var hash = keys[index]
      if(index > -1)
      {
        index = $scope.localMNs.findIndex(function(e){return e.txhash == hash})
        $scope.detail.current['alias'] = $scope.detail.current['oldalias'] = $scope.localMNs[index].alias
        $scope.detail.current['ip'] = $scope.localMNs[index].ip
        $scope.detail.current['privkey'] = $scope.localMNs[index].privkey
        $scope.detail.current['txhash'] = $scope.localMNs[index].txhash
        $scope.detail.current['txhashidx'] = parseInt($scope.localMNs[index].txhashidx)
        spawnMessage(MsgType.EDITMN, '', 'Edit ' + $scope.localMNs[index].alias)
      }
    }
  }

  $scope.editAction = function()
  {
    writeLog("edit")
    var keys = Object.keys($scope.selectedList)
    var templocalMNs = bestCopyEver($scope.localMNs)
    var selectedHash
    keys.forEach(function(element) {
      if($scope.selectedList[element])
      {
        var index = templocalMNs.findIndex(function(e){return e.txhash == element})
        templocalMNs.splice(index,1)
      }
    })

    index = templocalMNs.findIndex(function(e){return e.alias == $scope.detail.current.alias})
    if(index > -1)
    {
      spawnMessage(MsgType.ALERT, "Duplicate alias name")
      return
    }

    index = templocalMNs.findIndex(function(e){return strstd(e.privkey) == strstd($scope.detail.current.privkey)})
    if(index > -1)
    {
      spawnMessage(MsgType.ALERT, "Duplicate private key")
      return
    }

    index = templocalMNs.findIndex(function(e){return e.txhash == $scope.detail.current.txhash})
    if(index > -1)
    {
      spawnMessage(MsgType.ALERT, "Duplicate transaction hash")
      return
    }

    {
      if($scope.detail.current.ip.includes(":"))
      {
        if($scope.detail.current.ip[0] != "[")
        {
          $scope.detail.current.ip = "[" + $scope.detail.current.ip + "]"
        }
      }
      editMasternode(correctAliasName($scope.detail.current.alias), $scope.detail.current.ip, $scope.detail.current.privkey, $scope.detail.current.txhash, 
      $scope.detail.current.txhashidx, true, $scope.detail.current.oldalias, false)
      populateLocalMN()
      spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new configuration?", "Notice")
    }
  }

  $scope.copyAliasMasternode = function(isDisabled){
    writeLog("copyAliasMasternode")
    if(!isDisabled)
    {
      var keys = Object.keys($scope.selectedList)
      var index = keys.findIndex(function(e){return $scope.selectedList[e] == true})
      var hash = keys[index]
      if(index > -1)
      {
        index = $scope.localMNs.findIndex(function(e){return e.txhash == hash})
        var data = $scope.localMNs[index].alias + ' ' + $scope.localMNs[index].ip + ':16113 ' + $scope.localMNs[index].privkey + ' ' + $scope.localMNs[index].txhash + ' ' + $scope.localMNs[index].txhashidx
        copyToClipboard(data)
        spawnMessage(MsgType.ALERT, "Copied", "")
      }
    }
  }

  function copyToClipboard(input){
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val(input).select();
    document.execCommand("copy");
    $temp.remove();
  }

  $scope.restartAction = function(){
    //stop wallet
    isRestarting = true
    stopWallet()

    //check wallet status
    helpData = undefined
    setTimeout(walletStatusTimerFunction, 500, false)
  }

  function walletStatusTimerFunction(deleteCache){
    // writeLog(helpData)
    checkWallet()
    if(helpData != null && helpData != undefined)
    {
      if (helpData.result == null || helpData.result == undefined)
      {
        if(deleteCache)
        {
          var loc = getUserHome(serverData, settings) + "/mncache.dat"
          fs.unlinkSync(loc);
        }
        //refresh wallet
        var arg = []
        electron.ipcRenderer.send('main-reload', arg)
      }
      else
      {
        setTimeout(walletStatusTimerFunction, 500)
      }
    }
    else
    {
      setTimeout(walletStatusTimerFunction, 500)
    }
  }

  $scope.copyConfig = function(isDisabled){

    if(!isDisabled)
    {
      var data = []
      data.push('rpcuser=' + makeRandom(40))
      data.push('rpcpassword=' + makeRandom(40))
      data.push('addnode=dnsseed1.snowgem.org')
      data.push('addnode=dnsseed2.snowgem.org')
      data.push('addnode=dnsseed3.snowgem.org')
      data.push('addnode=explorer.snowgem.org')
      data.push('addnode=insight.snowgem.org')
      data.push('addnode=insight.snowgem.org')
      var keys = Object.keys($scope.selectedList)
      var index = keys.findIndex(function(e){return $scope.selectedList[e] == true})
      var hash = keys[index]
      if(index > -1)
      {
        index = $scope.localMNs.findIndex(function(e){return e.txhash == hash})
        data.push('masternodeaddr=' + $scope.localMNs[index].ip + ':16113')
        data.push('externalip=' + $scope.localMNs[index].ip + ':16113')
        data.push('masternodeprivkey=' + $scope.localMNs[index].privkey)
        data.push('masternode=1')
        data.push('txindex=1')
      }
      data = data.join('\n')
      copyToClipboard(data)
      spawnMessage(MsgType.ALERT, "Copied", "")
    }
  }

  $scope.lockUnlockMasternode = function(){
    writeLog("lockUnlockMasternode")
    var keys = Object.keys($scope.selectedList)
    if(keys.length >=2)
    {
      var status = false
      keys.forEach(function(element){
        if($scope.selectedList[element])
        {
          index = $scope.localMNs.findIndex(function(e){return e.txhash == element})
          writeLog(JSON.stringify($scope.localMNs[index]))
          if($scope.localMNs[index].status == 'No')
          {
            status = true
            return
          }
        }
      })

      keys.forEach(function(element){
        if($scope.selectedList[element])
        {
          index = $scope.localMNs.findIndex(function(e){return e.txhash == element})
          editMasternode(correctAliasName($scope.localMNs[index].alias), $scope.localMNs[index].ip, $scope.localMNs[index].privkey, $scope.localMNs[index].txhash, $scope.localMNs[index].txhashidx, status, $scope.localMNs[index].alias, false)
        }
      })
      populateLocalMN()
      spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new configuration?", "Notice")
    }
    else if(keys.length > 0 && keys.length < 2)
    {
      var status = false
      keys.forEach(function(element){
        if($scope.selectedList[element])
        {
          index = $scope.localMNs.findIndex(function(e){return e.txhash == element})
          if($scope.localMNs[index].status == 'No')
          {
            status = true
          }
          editMasternode(correctAliasName($scope.localMNs[index].alias), $scope.localMNs[index].ip, $scope.localMNs[index].privkey, $scope.localMNs[index].txhash, $scope.localMNs[index].txhashidx, status, $scope.localMNs[index].alias, false)
        }
      })
      populateLocalMN()
      spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new configuration?", "Notice")
    }
  }

  $scope.deleteMasternode = function(){
    var keys = Object.keys($scope.selectedList)
    var deletedList = ""
    keys.forEach(function(element){
      if($scope.selectedList[element])
      {
        var index = $scope.localMNs.findIndex(function(e){return e.txhash == element})
        deletedList += $scope.localMNs[index].alias + " "
      }
      deletedList.substring(0, deletedList.length - 2)
    })
    spawnMessage(MsgType.DELETE, "Do you want to delete: " + deletedList + '?', "Notice")
  }

  $scope.deletedAction = function()
  {
    var keys = Object.keys($scope.selectedList)
    var deletedList = ""
    keys.forEach(function(element){
      if($scope.selectedList[element])
      {
        var index = $scope.localMNs.findIndex(function(e){return e.txhash == element})
        removeMasternode($scope.localMNs[index].txhash)
      }
    })
    populateLocalMN()
    spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new configuration?", "Notice")
  }

  $scope.viewDetail = function(data){
    spawnMessage(MsgType.ALERT, JSON.stringify(data, null, 2), "Masternode Details")
  }

  $scope.startMasternode = function(){
    writeLog("startMasternode")
    var keys = Object.keys($scope.selectedList)
    var txhash = undefined
    keys.some(function(element){
      if($scope.selectedList[element] == true)
      {
        txhash = element
        return
      }
    })

    var index = $scope.localMNs.findIndex(function(element){
      return element.txhash == txhash
    })
    startMasternode($scope.localMNs[index].alias)
  }

  $scope.clearCache = function()
  {
    //stop wallet
    isRestarting = true
    stopWallet()

    //check wallet status
    helpData = undefined
    setTimeout(walletStatusTimerFunction, 500, true)
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  electron.ipcRenderer.on('child-masternode-list', function(event, msgData) {
    var data = msgData.msg
    populateLocalMN()
    populateNetworkMN(data)
  })

  electron.ipcRenderer.on('child-execute-timer', function(event, msgData)  {
    writeLog('execute masternode list timer')
    if(serverData.masternode)
    {
      setTimeout(getMasternodeList, 3000)
    }
  })

  electron.ipcRenderer.on('child-start-masternode', function(event, msgData)  {
    var data = msgData.msg.result
    writeLog(data)
    if(data.detail[0].result == 'successful')
    {
      var keys = Object.keys($scope.selectedList)
      var txhash = keys[0]
      var index = localMNs.findIndex(function(element){
        return element.txhash == txhash
      })
      startAlias($scope.localMNs[index].alias)
    }
    else
    {
      spawnMessage(MsgType.ALERT, data.detail[0].error, "FAILED!!!")
    }
  })

  electron.ipcRenderer.on('child-start-alias', function(event, msgData)  {
    var data = msgData.msg
    if(data.result.result != 'Successfully started alias')
    {
      spawnMessage(MsgType.ALERT, data.result.result, "FAILED!!!")
    }
    else
    {
      spawnMessage(MsgType.ALERT, data.result.result, "SUCCESS!!!")
    }
  })
}])
app.controller('MasternodesConfigCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {

  var ConfigStatus = {"OK": 0, "DUPLICATE": 1, "FAIL": 2}
  $scope.detail = {}
  $scope.detail.outputs = []
  $scope.detail.mnData = []
  $scope.detail.alias = undefined
  $scope.detail.ip = undefined
  $scope.detail.privkey = undefined
  $scope.detail.transactionID = undefined
  $scope.detail.index = undefined

  $scope.detail.showNewMasternodeData = false
  $scope.detail.btnDisabled = false
  isGetPrivKey = false
  function spawnMessage(type, text, title)
  {
    var arg = [ScreenType.MASTERNODES_CONFIG, true]
    electron.ipcRenderer.send('main-show-screen', arg)
    $timeout(function(){
      $scope.detail.title = title == undefined ? "Alert!!!" : title
      $scope.detail.text = text
      if(type == MsgType.ALERT)
      {
        $('#modalMasternodeConfigAlert').modal()
      }
      else if(type == MsgType.CONFIRMATION)
      {
        $('#modalMasternodeConfigConfirmation').modal()
      }
    },0)
  }

  function editMasternodeConfig(name, ip, privkey, txhash, txid, status, oldName, isNew)
  {
    writeLog(JSON.stringify(localMNs))
    var tempName = name
    if(name.startsWith('#'))
    {
      tempName = name.substring(1)
    }

    var index = localMNs.findIndex(function(e){return e.alias == tempName})
    if(index > -1)
    {
      spawnMessage(MsgType.ALERT, "Duplicate alias name")
      return
    }

    index = localMNs.findIndex(function(e){return strstd(e.privkey) == strstd(privkey)})
    if(index > -1)
    {
      spawnMessage(MsgType.ALERT, "Duplicate private key")
      return
    }

    index = localMNs.findIndex(function(e){return e.txhash == txhash})
    if(index > -1)
    {
      spawnMessage(MsgType.ALERT, "Duplicate transaction hash")
      return
    }

    {
      if(ip.includes(":"))
      {
        if(ip[0] != "[")
        {
          ip = "[" + ip + "]"
        }
      }
      editMasternode(correctAliasName(name), ip, privkey, txhash, txid, status, "", true)

      spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new configuration?", "Notice")
    }
  }

  function walletStatusTimerFunction(){
    // writeLog(helpData)
    checkWallet()
    if(helpData != null  && helpData != undefined)
    {
      if (helpData.result == null)
      {
        //refresh wallet
        var arg = []
        electron.ipcRenderer.send('main-reload', arg)
      }
      else
      {
        setTimeout(walletStatusTimerFunction, 500)
      }
    }
    else
    {
      setTimeout(walletStatusTimerFunction, 500)
    }
  }

  $scope.generate = function(){
    $scope.detail.showNewMasternodeData = false
    $scope.detail.btnDisabled = true
    isGetPrivKey = false
    getMNOutputs()
  }

  $scope.restartAction = function(){
    //stop wallet
    isRestarting = true
    stopWallet()

    //check wallet status
    helpData = undefined
    setTimeout(walletStatusTimerFunction, 500)
  }

  $scope.getPrivKey = function(){
    isGetPrivKey = true
    getMNPrivKey()
  }

  $scope.setupMasternode = function(){
    if ($scope.detail.alias == undefined)
    {
      spawnMessage(MsgType.ALERT, "Alias name could not be empty")
      return
    }
    else if ($scope.detail.alias.includes(' '))
    {
      spawnMessage(MsgType.ALERT, "Alias name must not contain whitespace")
      return
    }
    if ($scope.detail.ip == undefined)
    {
        spawnMessage(MsgType.ALERT, "IP address could not be empty")
        return
    }
    if ($scope.detail.privkey == undefined)
    {
        spawnMessage(MsgType.ALERT, "Private key could not be empty")
        return
    }
    if ($scope.detail.transactionID == undefined)
    {
        spawnMessage(MsgType.ALERT, "Transaction could not be empty")
        return
    }
    if ($scope.detail.index == undefined)
    {
        spawnMessage(MsgType.ALERT, "Transaction Index could not be empty")
        return
    }

    editMasternodeConfig($scope.detail.alias, $scope.detail.ip, $scope.detail.privkey, $scope.detail.transactionID, $scope.detail.index)
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  electron.ipcRenderer.on('child-masternode-outputs', function(event, msgData){
    var data = msgData.msg.result

    writeLog(JSON.stringify(localMNs))

    $timeout(function(){
      data.forEach(function(element){
        var index = localMNs.findIndex(function(e){return e.txhash == element.txhash})
        if(index == -1)
        {
          $scope.detail.outputs.push(element)
        }
      })

      if($scope.detail.outputs.length == 0)
      {
        $scope.detail.btnDisabled = false
        spawnMessage(MsgType.ALERT, 'You don\'t have any new output')
      }
      else
      {
        getMNPrivKey()
      }
    },0)
  })

  electron.ipcRenderer.on('child-masternode-genkey', function(event, msgData){
    var data = msgData.msg
    writeLog(data)
    $timeout(function(){
      if(isGetPrivKey)
      {
        spawnMessage(MsgType.ALERT, data.result, 'Masternode Key')
      }
      else
      {
        var temp = {}
        temp['privkey'] = data.result
        temp['txhash'] = $scope.detail.outputs[0].txhash
        temp['txhashidx'] = $scope.detail.outputs[0].outputidx
        temp['no'] = $scope.detail.mnData.length + 1

        $scope.detail.mnData.push(temp)
        $scope.detail.outputs.splice(0, 1)
        if($scope.detail.outputs.length > 0)
        {
          getMNPrivKey()
        }
        else
        {
          $scope.detail.showNewMasternodeData = true
          $scope.detail.btnDisabled = false
        }
      }
    },0)
  })

}])
app.controller('OverviewCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.balances = {
    totalCoins: -1,
    transparentCoins: -1,
    privateCoins: -1,
    unconfirmedCoins: -1,
    lockedCoins: -1,
    immatureCoins: -1
  }
  var count = 0
  isInit = true
  $scope.bestHeight = undefined
  $scope.visible = false
  $scope.startingText = 'Good morning!'
  $scope.detail = {}
  $scope.detail.sticker = "XSG"
  $scope.detail.transactionschart = false
  $scope.detail.transactionTime = 1
  $scope.rawData = {}
  $scope.walletData = {}
  $scope.dataChange = {}
  $scope.detail.banner = {}
  $scope.detail.chartText = ""
  var addressList
  var chart = undefined
  var oldBalance = 0
  updateText()
  setInterval(updateText, 60000)

  function spawnMessage(type, text, title)
  {
    $scope.detail.title = title == undefined ? "Alert!!!" : title
    $scope.detail.text = text
    if(type == MsgType.ALERT)
    {
      $('#modalOverviewAlert').modal()
    }
  }

  function updateText(){
    var d = new Date();
    var n = parseInt(d.getHours());
    if(0 <= n && n < 12)
    {
      $scope.startingText = 'Good morning!'
    }
    else if( 12 <= n && n < 18)
    {
      $scope.startingText = 'Good afternoon!'
    }
    else
    {
      $scope.startingText = 'Good evening!'
    }
  }
  function getDataTimerFunction(){
    writeLog('get wallet data')
    getNetworkHeight()

    if(apiStatus == undefined || apiStatus['getalldata'] == undefined || apiStatus['getalldata'] == false)
    {
      if(getinfoData != undefined)
      {
        if (count == 15)
        {
            shouldGetWallet = true; // should get wallet at least 1 time per 120 sec
        }

        var height = getinfoData.result.blocks
        if(shouldGetAll == true || $scope.bestHeight + 1 <= height)
        {
          if($scope.detail.transactionschart)
          {
            getAllData(GetAllDataType.ALL, parseInt($scope.detail.transactionTime))
          }
          else
          {
            getAllData(GetAllDataType.ALL)
          }
          shouldGetAll = false
          shouldGetWallet = false
          shouldGetTransaction = false
        }
        else if(shouldGetTransaction)
        {
          if($scope.detail.transactionschart)
          {
            getAllData(GetAllDataType.WITH_TRANSACTIONS, parseInt($scope.detail.transactionTime))
          }
          else
          {
            getAllData(GetAllDataType.WITH_TRANSACTIONS)
          }
        }
        else if(shouldGetWallet == true)
        {
          getAllData(GetAllDataType.WITH_BALANCE)
          shouldGetWallet = false
          count = 0
        }
        else
        {
          getAllData(GetAllDataType.NONE)
        }
        $scope.bestHeight = height
        writeLog('$scope.bestHeight = ' + $scope.bestHeight + ', height = ' + height)
      }
      else
      {
        if($scope.detail.transactionschart)
        {
          getAllData(GetAllDataType.ALL, parseInt($scope.detail.transactionTime))
        }
        else
        {
          getAllData(GetAllDataType.ALL)
        }
      }
      count += 1
    }
  }
  
  function getDataTimerFunctionZcash(){
    writeLog('get wallet data')
    $scope.dataChange.getinfo = undefined
    $scope.dataChange.getwalletinfo = undefined
    $scope.dataChange.z_gettotalbalance = undefined
    getNetworkHeight(serverData.cointype)
    getWalletInfo(serverData.cointype)
    zGetTotalBalance(serverData.cointype)
  }

  function getWalletData(){
    if(apiStatus['getwalletdata'] == undefined || apiStatus['getwalletdata'] == false)
    {
      apiStatus['getwalletdata'] = true
      getBestBlockhash(serverData.cointype)
    }
  }

  function updateTransactionsTime(arg)
  {
    var data = arg.data
    var days = 1
    $timeout(function(){
      $scope.detail.chartText = "Your transactions in the last 24 hours"
      if(arg.time == 2)
      {
        days = 7
        $scope.detail.chartText = "Your transactions in the last 7 days"
      }
      else if(arg.time == 3)
      {
        days = 30
        $scope.detail.chartText = "Your transactions in the last month"
      }
      else if(arg.time == 4)
      {
        days = 90
        $scope.detail.chartText = "Your transactions in the last quarter"
      }
      else if(arg.time == 5)
      {
        days = 365
        $scope.detail.chartText = "Your transactions in the last year"
      }
      if(data != undefined && $scope.detail.transactionschart)
      {
        $scope.detail.dataChart = []
        var endTime = Math.round((new Date()).getTime() / 1000)
        var startTime = endTime - days * 24 * 60 * 60
        startTime = (parseInt(startTime / 1800 / days) + 1) * 1800 * days
        endTime = (parseInt(endTime / 1800 / days) + 1) * 1800 * days

        for (i = startTime; i < endTime; i += 1800 * days) { 
          var temp = {}
          temp['time'] = i * 1000
          temp['in'] = 0
          temp['out'] = 0
          $scope.detail.dataChart.push(temp)
        }

        $scope.detail.dataChart['totalIn'] = 0
        $scope.detail.dataChart['totalOut'] = 0

        data.forEach(function(element){
          var time = parseInt(element.time / 1800 / days) * 1800 * days
          var index = $scope.detail.dataChart.findIndex(function(e){return e.time == time * 1000})
          if(index > -1)
          {
            if(element.amount > 0)
            {
              $scope.detail.dataChart[index].in += element.amount
              $scope.detail.dataChart[index].in = parseFloat($scope.detail.dataChart[index].in.toFixed(8))
              $scope.detail.dataChart['totalIn'] += element.amount
            }
            else
            {
              $scope.detail.dataChart[index].out -= Math.abs(element.amount)
              $scope.detail.dataChart[index].out = parseFloat($scope.detail.dataChart[index].out.toFixed(8))
              $scope.detail.dataChart['totalOut'] += element.amount
            }
          }
        })

        $scope.detail.dataChart['totalIn'] = parseFloat($scope.detail.dataChart['totalIn'].toFixed(8))
        $scope.detail.dataChart['totalOut'] = parseFloat($scope.detail.dataChart['totalOut'].toFixed(8))

        if(chart == undefined)
        {
          chart = Morris.Line({
            element: 'chartLines',
            data: [],
            xkey: 'time',
            ykeys: ['in', 'out'],
            labels: ['vIn', 'vOut'],
            resize: true,
            pointSize: 3,
            smooth: false,
            gridTextColor: '#474e54',
            gridLineColor: '#eef0f2',
            goalLineColors: '#e3e6ea',
            gridTextWeight: '300',
            numLines: 9,
            gridtextSize: 14,
            lineWidth: 1,
            lineColors: ['#00b300', '#ff3333']
          })
        }
        chart.setData($scope.detail.dataChart)
      }
    },0)
  }

  electron.ipcRenderer.on('child-execute-timer', function(event, msgData){
    writeLog('execute screen summary timer')
    if(msgData.msg[1].cointype == 'snowgem')
    {
      setTimeout(getDataTimerFunction, 3000)
    }
    else if(msgData.msg[1].cointype == 'zcash')
    {
      setTimeout(getDataTimerFunctionZcash, 3000)
    }
  })

  electron.ipcRenderer.on('child-summary-data', function(event, msgData){
    var data = msgData.msg
    // writeLog(data.value)
    if(data.key == 'getalldata')
    {
      if(data.value.result == null && !isRestarting)
      {
        spawnMessage(MsgType.ALERT, data.value.error.message)
      }
      else if(!isRestarting)
      {
        allData = data.value.result
        var allData
        var arg
        if(allData != undefined)
        {
          allData = allData
          arg = data.arg
        
          if(arg[1] == GetAllDataType.WITH_TRANSACTIONS)
          {
            listtransactions = allData.listtransactions

            listtransactions.reverse()

            var data = {}
            data['data'] = listtransactions
            data['time'] = $scope.detail.transactionTime
            electron.ipcRenderer.send('main-update-transactions', data)
          }
          else if(arg[1] == GetAllDataType.WITH_BALANCE)
          {
            walletDic = allData.addressbalance[0]

            walletDic = updateWalletDic(walletDic)

            // writeLog(JSON.stringify(walletDic))

            var addr = {}
            addr['from'] = walletDic
            addr['book'] = book

            //@TODO populate addresses
            electron.ipcRenderer.send('main-update-address', addr)

            //@TODO populate send
            electron.ipcRenderer.send('main-update-send', addr)

            //@TODO update send coin from, shield coin from
            electron.ipcRenderer.send('main-update-shield', addr)
          }
          else if(arg[1] == GetAllDataType.ALL)
          {
            listtransactions = allData.listtransactions

            listtransactions.reverse()

            walletDic = allData.addressbalance[0]

            walletDic = updateWalletDic(walletDic)

            // writeLog(JSON.stringify(walletDic))

            var addr = {}
            addr['from'] = walletDic
            addr['book'] = book

            //@TODO populate addresses
            electron.ipcRenderer.send('main-update-address', addr)

            //@TODO populate send
            electron.ipcRenderer.send('main-update-send', addr)

            //@TODO update send coin from, shield coin from
            electron.ipcRenderer.send('main-update-shield', addr)

            var data = {}
            data['data'] = listtransactions
            data['time'] = $scope.detail.transactionTime
            electron.ipcRenderer.send('main-update-transactions', data)
          }

          //@TODO update best block hash

          //@TODO update best block time
          var bestTime = allData.besttime

          var connections = allData.connectionCount
          var block = allData.block
          var loadingData = {}
          loadingData['besttime'] = bestTime
          loadingData['connections'] = connections
          loadingData['block'] = block
          electron.ipcRenderer.send('main-update-loading', loadingData)

          //@TODO update sync bar

          //@TODO update connection

          //@TODO update all balances
          $timeout(function(){
            $scope.balances.totalCoins = allData.totalbalance
            $scope.balances.remainingvalue = allData.remainingValue
            $scope.balances.transparentCoins = allData.transparentbalance
            $scope.balances.privateCoins = allData.privatebalance
            $scope.balances.unconfirmedCoins = allData.unconfirmedbalance
            $scope.balances.lockedCoins = allData.lockedbalance
            $scope.balances.immatureCoins = allData.immaturebalance
            balance = $scope.balances
            if(lastBalance == undefined || lastBalance.totalCoins != $scope.balances.totalCoins || lastBalance.transparentCoins != $scope.balances.transparentCoins || 
              lastBalance.privateCoins != $scope.balances.privateCoins || lastBalance.unconfirmedCoins != $scope.balances.unconfirmedCoins ||
              lastBalance.lockedCoins != $scope.balances.lockedCoins || lastBalance.immatureCoins != $scope.balances.immatureCoins)
            {
              lastBalance = $scope.balances
              //get all data again if balance change
              if(arg[1] != GetAllDataType.ALL)
              {
                shouldGetAll = true
              }
            }
            electron.ipcRenderer.send('main-update-locked-coin', allData.remainingValue)
          }, 0);


          if(isInit)
          {
            var arg = [ScreenType.OVERVIEW, true]
            electron.ipcRenderer.send('main-show-screen', arg)
            isInit = false
          }
          //show overview screen
        }
        apiStatus['getalldata'] = false
        setTimeout(getDataTimerFunction, 10000)
      }
    }
  })

  function processRawData(rawData, shouldGetWallet, shouldGetTransaction)
  {
    writeLog('processRawData')

    $scope.balances.totalCoins = rawData.totalbalance
    $scope.balances.transparentCoins = rawData.transparentbalance
    $scope.balances.remainingvalue = rawData.remainingValue == undefined ? 0 : rawData.remainingValue
    $scope.balances.privateCoins = rawData.privatebalance == undefined ? 0 : rawData.privatebalance
    $scope.balances.unconfirmedCoins = rawData.unconfirmedbalance
    $scope.balances.lockedCoins = rawData.lockedbalance == undefined ? 0 : rawData.lockedbalance
    $scope.balances.immatureCoins = rawData.immaturebalance
    balance = $scope.balances
    var loadingData = {}
    loadingData['besttime'] = rawData.besttime
    loadingData['connections'] = rawData.connectionCount
    electron.ipcRenderer.send('main-update-loading', loadingData)
    electron.ipcRenderer.send('main-update-locked-coin', rawData.remainingValue)
    // if(shouldGetWallet)
    {
      var addressData = updateWalletDic(rawData.addressbalance)

      var addr = {}
      addr['from'] = addressData
      addr['book'] = book
  
      //@TODO populate addresses
      electron.ipcRenderer.send('main-update-address', addr)
  
      //@TODO populate send
      electron.ipcRenderer.send('main-update-send', addr)
  
      //@TODO update send coin from, shield coin from
      electron.ipcRenderer.send('main-update-shield', addr)
    }

    // if(shouldGetTransaction)
    {
      listtransactions = rawData.listtransactions

      listtransactions.reverse()

      var data = {}
      data['data'] = listtransactions
      data['time'] = 1 //only 1 day for other coins
      electron.ipcRenderer.send('main-update-transactions', data)
    }

    if(isInit)
    {
      var arg = [ScreenType.OVERVIEW, true]
      electron.ipcRenderer.send('main-show-screen', arg)
      isInit = false
    }
    apiStatus['getwalletdata'] = false
    shouldGetAll = false
    setTimeout(getDataTimerFunctionZcash, 10000)
  }

  function processAddress(addressData)
  {
    writeLog(addressData)
    addressList = Object.keys(addressData)
    $scope.rawData.addressbalance = addressData
    verifyAllAddress()
    // apiStatus['addressbalance'] = false
    // var temp = apiStatus['bestblock'] | apiStatus['addressbalance'] | apiStatus['listtransactions']
    // if(temp == false)
    // {
    //   processRawData($scope.rawData, shouldGetWallet, shouldGetTransaction)
    // }
  }

  function verifyAllAddress()
  {
    if(addressList.length > 0)
    {
      verifyAddress(addressList[0], undefined, serverData.cointype)
      addressList.splice(0,1)
    }
    else
    {
      addressList = Object.keys($scope.rawData.addressbalance)
      getBalaceAllAddress()
    }
  }

  function getBalaceAllAddress()
  {
    if(addressList.length > 0)
    {
      getAddressBalance(addressList[0], serverData.cointype)
      addressList.splice(0,1)
    }
    else
    {
      processRawData($scope.rawData, shouldGetWallet, shouldGetTransaction)
    }
  }

  $scope.closeOverviewBanner = function() {
    $scope.detail.showBanner = false
  }

  electron.ipcRenderer.on('child-update-settings', function(event, msgData){
    $timeout(function(){
      if(msgData.msg[2] != null && msgData.msg[2] != undefined)
      {
        $scope.detail.sticker = msgData.msg[2].sticker
        $scope.detail.coin = msgData.msg[2].coinname
        $scope.detail.transactionschart = msgData.msg[0].transactionschart == undefined ? true : msgData.msg[0].transactionschart
        $scope.detail.hideLockedCard = !(msgData.msg[2].lockedcoin == undefined ? false : msgData.msg[2].lockedcoin)
      }
      if(msgData.msg[0] != null && msgData.msg[0] != undefined)
      {
        $scope.detail.transactionTime = msgData.msg[0].transactionstime == undefined ? 1 : msgData.msg[0].transactionstime
      }
      
    }, 0)
  })

  electron.ipcRenderer.on('child-update-transactions-time', function(event, msgData){
    updateTransactionsTime(msgData.msg)
  })

  electron.ipcRenderer.on('child-update-chart', function(event, msgData){
    $timeout(function(){
      if(chart != undefined)
      {
        chart.setData($scope.detail.dataChart)
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-get-data-zcash', function(event, msgData){
    // writeLog('child-get-data-zcash')
    $timeout(function(){
      var data = msgData.msg
      console.log(data)
      if(data.key == 'getinfo')
      {
        if(lastBlock != data.value.result.blocks)
        {
          lastBlock = data.value.result.blocks
          $scope.rawData.connectionCount = data.value.result.connections
          $scope.dataChange.getinfo = true
        }
        else
        {
          $scope.dataChange.getinfo = false
        }
      }
      else if(data.key == 'getwalletinfo')
      {
        if(lastBalance == undefined || lastBalance.balance != data.value.result.balance || 
          lastBalance.unconfirmed_balance != data.value.result.unconfirmed_balance || lastBalance.immature_balance != data.value.result.immature_balance)
        {
          lastBalance = data.value.result
          $scope.rawData.unconfirmedbalance = data.value.result.unconfirmed_balance
          $scope.rawData.immaturebalance = data.value.result.immature_balance
          $scope.dataChange.getwalletinfo = true
        }
        else
        {
          $scope.dataChange.getwalletinfo = false
        }
      }
      else if(data.key == 'z_gettotalbalance')
      {
        if(lastTotalBalance == undefined || lastTotalBalance.transparent != data.value.result.transparent || 
          lastTotalBalance.private != data.value.result.private)
        {
          lastTotalBalance = data.value.result
          $scope.rawData.totalbalance = data.value.result.total
          $scope.rawData.privatebalance = data.value.result.private
          $scope.rawData.transparentbalance = data.value.result.transparent
          $scope.dataChange.z_gettotalbalance = true
        }
        else
        {
          $scope.dataChange.z_gettotalbalance = false
        }
      }
      if((($scope.dataChange.z_gettotalbalance != undefined && $scope.dataChange.getwalletinfo != undefined && $scope.dataChange.getinfo != undefined) &&
        ($scope.dataChange.z_gettotalbalance || $scope.dataChange.getwalletinfo || $scope.dataChange.getinfo)) || shouldGetAll)
      {
        $scope.dataChange.getinfo = undefined
        $scope.dataChange.getwalletinfo = undefined
        $scope.dataChange.z_gettotalbalance = undefined
        getWalletData()
      }
      else if($scope.dataChange.z_gettotalbalance == false && $scope.dataChange.getwalletinfo == false && $scope.dataChange.getinfo == false)
      {
        writeLog("set time out 2")
        setTimeout(getDataTimerFunctionZcash, 10000)
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-get-blockchain-info-zcash', function(event, msgData){
    writeLog('child-get-blockchain-info-zcash')
    $timeout(function(){
      $scope.rawData.bestblockhash = msgData.msg.value.result.bestblockhash
      getBestTime($scope.rawData.bestblockhash, serverData.cointype)
    }, 0)
  })

  electron.ipcRenderer.on('child-get-block-header-zcash', function(event, msgData){
    writeLog('child-get-block-header-zcash')
    $timeout(function(){
      $scope.rawData.besttime = msgData.msg.value.result.time
      listTransactions(200, serverData.cointype)
    }, 0)
  })

  electron.ipcRenderer.on('child-list-transactions-zcash', function(event, msgData){
    writeLog('child-list-transactions-zcash')
    $timeout(function(){
      $scope.rawData.listtransactions = msgData.msg.value.result
      listReceivedByAddress(serverData.cointype)
    }, 0)
  })

  electron.ipcRenderer.on('child-list-received-by-address-zcash', function(event, msgData){
    writeLog('child-list-received-by-address-zcash')
    $timeout(function(){
      if(msgData.msg.value.result != undefined)
      {
        msgData.msg.value.result.forEach(function(element){
          var temp = {'amount': 0, 'ismine': false}
          $scope.walletData[element.address] = temp
        })
        listAddressGroupings(serverData.cointype)
      }
      else
      {
        apiStatus['getwalletdata'] = false
        shouldGetAll = false
        setTimeout(getDataTimerFunctionZcash, 10000)
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-list-address-groupings-zcash', function(event, msgData){
    $timeout(function(){
      var key = Object.keys($scope.walletData)
      if(msgData.msg.value.result != undefined)
      {
        msgData.msg.value.result.forEach(function(element){
          element.forEach(function(e){
            var index = key.findIndex(function(k){return k == e[0]})
            if(index == -1)
            {
              var temp = {'amount': 0, 'ismine': false}
              $scope.walletData[e[0]] = temp
            }
          })
        })
        zListAddress(serverData.cointype)
      }
      else
      {
        apiStatus['getwalletdata'] = false
        shouldGetAll = false
        setTimeout(getDataTimerFunctionZcash, 10000)
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-z-list-address-zcash', function(event, msgData){
    writeLog('child-z-list-address-zcash')
    $timeout(function(){
      if(msgData.msg.value.result != undefined)
      {
        msgData.msg.value.result.forEach(function(element){
          var temp = {'amount': 0, 'ismine': false}
          $scope.walletData[element] = temp
        });
        processAddress($scope.walletData)
      }
      else
      {
        apiStatus['getwalletdata'] = false
        shouldGetAll = false
        setTimeout(getDataTimerFunctionZcash, 10000)
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-validate-address-zcash', function(event, msgData){
    // writeLog('child-validate-address-zcash')
    $timeout(function(){
      if(msgData.msg.value.result.isvalid == false)
      {
        verifyZAddress(msgData.msg.arg[1], undefined, serverData.cointype)
      }
      else
      {
        $scope.rawData.addressbalance[msgData.msg.arg[1]].ismine = msgData.msg.value.result.ismine
        verifyAllAddress()
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-z-validate-address-zcash', function(event, msgData){
    // writeLog('child-z-validate-address-zcash')
    $timeout(function(){
      $scope.rawData.addressbalance[msgData.msg.arg[1]].ismine = msgData.msg.value.result.ismine
      verifyAllAddress()
    }, 0)
  })

  electron.ipcRenderer.on('child-z-get-balance-zcash', function(event, msgData){
    // writeLog('child-z-get-balance-zcash')
    $timeout(function(){
      $scope.rawData.addressbalance[msgData.msg.arg[1]].amount = msgData.msg.value.result
      getBalaceAllAddress()
    }, 0)
  })

  electron.ipcRenderer.on('child-notification-data', function(event, msgData) {
    var data = msgData.msg.banner
    $timeout(function(){
      if(data != undefined && data.length > 0)
      {
        var random = Math.floor(Math.random() * data.length)
        if(checkNoticeDisplay(serverData, data[random].type, data[random].name))
        {
          $scope.detail.banner = data[random]
          $scope.detail.showBanner = true
          saveNoticeDisplay(data[random].type, data[random].name)
        }
        else
        {
          $scope.detail.showBanner = false
        }
      }
    },0)
  })
}]);

app.controller('SendCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {

  $scope.publicAddresses = []
  $scope.privateAddresses = []
  $scope.books = []
  $scope.detail = {}
  $scope.detail.selected = undefined
  $scope.detail.recipientAddress = undefined
  $scope.detail.message = undefined
  $scope.detail.amount = undefined
  $scope.detail.value = '1'
  $scope.detail.fee = 0.0001
  $scope.detail.btnDisable = false
  $scope.detail.isBot = false
  $scope.visible = false

  function spawnMessage(type, text, title)
  {
    var arg = [ScreenType.SEND, true]
    electron.ipcRenderer.send('main-show-screen', arg)
    $timeout(function(){
      $scope.detail.title = title == undefined ? "Alert!!!" : title
      $scope.detail.text = text
      if(type == MsgType.ALERT)
      {
        $('#modalSendAlert').modal()
      }
      else if(type == MsgType.CONFIRMATION)
      {
        $('#modalSendConfirmation').modal()
      }
    },0)
  }

  $scope.sendClick = function(){
    // writeLog("send coin")
    if($scope.detail.selected == undefined || $scope.detail.selected == '')
    {
      writeLog("send address = null")
      spawnMessage(MsgType.ALERT, 'Please select send address')
      return undefined
    }

    if($scope.detail.recipientAddress == undefined || $scope.detail.recipientAddress == '')
    {
      writeLog("recipient address = null")
      spawnMessage(MsgType.ALERT, 'Please put receiver address')
      return undefined
    }

    if($scope.detail.amount == undefined || $scope.detail.amount == '')
    {
      writeLog("amount = null")
      spawnMessage(MsgType.ALERT, 'Please put amount to send')
      return undefined
    }

    writeLog($scope.detail.fee)
    if($scope.detail.fee == undefined || $scope.detail.fee === '')
    {
      writeLog("fee = null")
      spawnMessage(MsgType.ALERT, 'Please put transaction fee')
      return undefined
    }
    writeLog("verifyAddress")
    $scope.detail.btnDisable = true
    var dataToSend = {}
    dataToSend['from'] = $scope.detail.selected
    dataToSend['to'] = $scope.detail.recipientAddress
    var realAmount = parseFloat($scope.detail.amount) * parseFloat($scope.detail.value)
    dataToSend['amount'] = realAmount
    dataToSend['fee'] =  $scope.detail.fee
    $scope.detail.isBot = false
    verifyAddress($scope.detail.recipientAddress, dataToSend)
  }

  $scope.selectAddress = function(addr){
    $scope.detail.selected = addr
  }

  $scope.detail.recipientAddressChange = function(data)
  {
    $scope.detail.recipientAddress = data
  }

  $scope.amountChange = function(data)
  {
    $scope.detail.amount = data
  }

  $scope.valueChange = function(data)
  {
    $scope.detail.value = data
  }

  $scope.feeChange = function(data)
  {

    $scope.detail.fee = data
  }

  $scope.messageChange = function(data)
  {
    $scope.detail.message = data
  }

  function populateAddress(data){
    var walletDic = data.from
    var keys = Object.keys(walletDic)
    writeLog('JSON.stringify(walletDic)')

    $timeout(function(){
      $scope.publicAddresses = []
      $scope.privateAddresses = []
      keys.forEach(function(element){
        var temp = {}
        temp['text'] = element + " - " + walletDic[element].amount
        temp['value'] = element.split(' (')[0]
        temp['amount'] = walletDic[element].amount
        if(element.startsWith('z'))
        {
          var index = $scope.privateAddresses.findIndex(function(e){return e.text.split(' - ')[0] === temp.text.split(' - ')[0]})
          if (index == -1) {
            if(walletDic[element].amount > 0)
            {
              $scope.privateAddresses.push(temp)
            }
          }
          else
          {
            if($scope.privateAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1] 
              && parseFloat(temp.text.split(' - ')[1]) > 0)
            {
              $scope.privateAddresses[index].text = temp.text
            }
            else if($scope.privateAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1] 
              && parseFloat(temp.text.split(' - ')[1]) == 0)
            {
              $scope.privateAddresses.splice(index, 1)
            }
          }
        }
        else
        {
          var index = $scope.publicAddresses.findIndex(function(e){return e.text.split(' - ')[0] === temp.text.split(' - ')[0]})
          if (index == -1) {
            if(walletDic[element].amount > 0)
            {
              if(walletDic[element].ismine)
              {
                $scope.publicAddresses.push(temp)
              }
            }
          }
          else
          {
            if($scope.publicAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1] 
              && parseFloat(temp.text.split(' - ')[1]) > 0)
            {
              $scope.publicAddresses[index].text = temp.text
            }
            else if($scope.publicAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1] 
              && parseFloat(temp.text.split(' - ')[1]) == 0)
            {
              $scope.publicAddresses.splice(index, 1)
            }
          }
        }
      })

      var book = data.book
      if(book != undefined)
      {
        $scope.books = []
        keys = Object.keys(book)
        keys.forEach(function(element){
          var temp = {}
          temp['text'] = book[element]
          temp['value'] = element
          if (!$scope.books.filter(function(e){return e.text === temp.text}).length > 0) {
            $scope.books.push(temp)
          }
        })

        addrBook = JSON.parse(angular.toJson($scope.books))
      }

      if($scope.detail.selected == undefined && $scope.publicAddresses.length > 0)
      {
        $scope.detail.selected = $scope.publicAddresses[0].value
      }
    },0)
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  $scope.maxCoinClick = function(){
    var temp = $scope.publicAddresses.concat($scope.privateAddresses)
    var maxAmount = 0
    temp.forEach(function(element){
      if(element.value == $scope.detail.selected)
      {
        maxAmount = element.amount
      }
    })
    $scope.detail.amount = parseFloat((parseFloat(maxAmount) - parseFloat($scope.detail.fee)).toFixed(8))
  }

  electron.ipcRenderer.on('child-update-send', function(event, msgData){
    var data = msgData.msg
    populateAddress(data)
  })

  electron.ipcRenderer.on('child-verify-address', function(event, msgData){
    var info = msgData.msg
    var data = info[0].result
    var arg = info[1]
    if(data != undefined && data.isvalid == true)
    {
      $timeout(function(){
        exec_sendCoin(arg[2].from, arg[2].to, String(arg[2].amount).replace(',','.'), String(arg[2].fee).replace(',','.'), SendType.NORMAL)
      },0)
    }
    else if(data != undefined && data.isvalid == false)
    {
      $timeout(function(){
        writeLog(arg[2])
        verifyZAddress(arg[2].to, arg[2])
      },0)
    }
  })

  electron.ipcRenderer.on('child-verify-zaddress', function(event, msgData){
    var info = msgData.msg
    var data = info[0].result
    var arg = info[1]
    if(data != undefined && data.isvalid == true)
    {
      $timeout(function(){
        exec_sendCoin(arg[2].from, arg[2].to, String(arg[2].amount).replace(',','.'), String(arg[2].fee).replace(',','.'), SendType.NORMAL)
      },0)
    }
    else if(data != undefined && data.isvalid == false)
    {
      $timeout(function(){
        $scope.detail.btnDisable = false
        var msg = "Invalid address " + $scope.detail.recipientAddress
        if($scope.detail.isBot == false)
        {
          spawnMessage(MsgType.ALERT, msg)
        }
        else
        {
          sendBotReplyMsg(msg)
        }
      },0)
    }
  })

  electron.ipcRenderer.on('child-send-coin', function(event, msgData){
    var data = msgData.msg
    // writeLog(data)
    if(data.result != null)
    {
      checkTransaction(data.result, SendType.NORMAL)
    }
    else
    {
      $timeout(function(){
        $scope.detail.btnDisable = false
        if($scope.detail.isBot == false)
        {
          spawnMessage(MsgType.ALERT, data.error.message)
        }
        else
        {
          sendBotReplyMsg(data.error.message)
        }
      },0)
      
    }
  })

  electron.ipcRenderer.on('child-check-transaction', function(event, msgData){
    // writeLog(msgData.msg)
    var data = msgData.msg
    if(data.result == null)
    {
      $timeout(function(){
        $scope.detail.btnDisable = false
        var msg = "Check transaction error"
        if($scope.detail.isBot == false)
        {
          spawnMessage(MsgType.ALERT, msg)
        }
        else
        {
          sendBotReplyMsg(msg)
        }
      },0)
    }
    else
    {
      //send done, check status
      var element = data.result[0]
      // writeLog(element)
      var status = element.status
      if(status == "executing")
      {
        setTimeout(function(){
          checkTransaction(element.id, SendType.NORMAL)
          //update sending process
        }, 2000);
      }
      else if(status == "success")
      {
        $timeout(function(){
          $scope.detail.btnDisable = false
          var msg = "Success"
          if($scope.detail.isBot == false)
          {
            spawnMessage(MsgType.ALERT, msg)
          }
          else
          {
            msg += "\n" + explorer + "tx/" + element.result.txid
            sendBotReplyMsg(msg)
          }
          shouldGetAll = true
          $scope.detail.amount = undefined
          $scope.detail.recipientAddress = undefined
          $scope.detail.message = undefined
        },0)
      }
      else
      {
        $scope.detail.btnDisable = false
        var msg = element.error.message
        if($scope.detail.isBot == false)
        {
          spawnMessage(MsgType.ALERT, msg)
        }
        else
        {
          sendBotReplyMsg(msg)
        }
      }
    }
  })

  electron.ipcRenderer.on('child-update-settings', function(event, msgData){
    $timeout(function(){
      if(msgData.msg[2] != null && msgData.msg[2] != undefined)
      {
        $scope.detail.sticker = msgData.msg[2].sticker
        $scope.detail.stickerSmall = 'm' + msgData.msg[2].sticker
      }
    }, 0)
  })

  electron.ipcRenderer.on('child-execute-send-coin', function(event, msgData){
    $timeout(function(){
      if(msgData.msg != undefined)
      {
        var data = msgData.msg
        $scope.detail.btnDisable = true
        var dataToSend = {}
        dataToSend['from'] = data.from
        dataToSend['to'] = data.to
        dataToSend['amount'] = data.value
        dataToSend['fee'] =  $scope.detail.fee
        $scope.detail.isBot = data.isBot
        verifyAddress(data.to, dataToSend)
      }
    }, 0)
  })
  
}]);

app.controller('ShieldCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.publicAddresses = []
  $scope.privateAddresses = []
  $scope.shieldAddresses = []
  $scope.detail = {}
  $scope.detail.shieldAddress = undefined
  // $scope.shieldList = []
  $scope.detail.publicAddr = undefined
  $scope.detail.privateAddr = undefined
  $scope.detail.fee = 0.0001
  $scope.detail.remainingvalue = 0
  var isShieldAll = false
  var isAutoShield = false
  var isMultipleShield = false
  var continueShieldTimer = undefined
  $scope.detail.btnEnabled = true
  $scope.detail.bestTime = -1
  $scope.detail.lastBestTime = -1
  function spawnMessage(type, text, title)
  {
    var arg = [ScreenType.SHIELD, true]
    electron.ipcRenderer.send('main-show-screen', arg)
    $timeout(function(){
      $scope.detail.title = title == undefined ? "Alert!!!" : title
      $scope.detail.text = text
      if(type == MsgType.ALERT)
      {
        $('#modalShieldAlert').modal()
      }
      else if(type == MsgType.CONFIRMATION)
      {
        $('#shieldAllConfirmation').modal()
      }
    },0)
  }

  function populateAddress(data){
    var walletDic = data.from
    var keys = Object.keys(walletDic)
    $timeout(function(){
      $scope.publicAddresses = []
      $scope.privateAddresses = []
      keys.forEach(function(element){
        var temp = {}
        temp['text'] = element + " - " + walletDic[element].amount
        temp['value'] = element.split(' (')[0]
        if(element.startsWith('z'))
        {
          var index = $scope.privateAddresses.findIndex(function(e){return e.text.split(' - ')[0] === temp.text.split(' - ')[0]})
          if (index == -1) {
            $scope.privateAddresses.push(temp)
          }
          else
          {
            if($scope.privateAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1])
            {
              $scope.privateAddresses[index].text = temp.text
            }
          }
        }
        else
        {
          var index = $scope.publicAddresses.findIndex(function(e){return e.text.split(' - ')[0] === temp.text.split(' - ')[0]})
          if (index == -1) {
            if(walletDic[element].amount > 0)
            {
              if(walletDic[element].ismine)
              {
                $scope.publicAddresses.push(temp)
              }
            }
          }
          else
          {
            if($scope.publicAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1] 
              && parseFloat(temp.text.split(' - ')[1]) > 0)
            {
              $scope.publicAddresses[index].text = temp.text
            }
            else if($scope.publicAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1] 
              && parseFloat(temp.text.split(' - ')[1]) == 0)
            {
              $scope.publicAddresses.splice(index, 1)
            }
          }
        }
      })
    },0)
  }

  function autoShield(threshold, addr)
  {
    writeLog("check auto shield, locked coin = " + $scope.detail.remainingvalue + ", threshold = " + threshold)
    if(!isShieldAll && isSynced && parseInt($scope.detail.remainingvalue) >= threshold)
    {
      $scope.detail.privateAddr = addr
      isAutoShield = true
      $scope.detail.btnEnabled = false
      isShieldAll = true
      exec_sendCoin('*', $scope.detail.privateAddr, 0, $scope.detail.fee, SendType.SHIELD)
    }
  }

  function multipleShield(addr)
  {
    if(!isShieldAll && isSynced)
    {
      $scope.detail.privateAddr = addr
      isMultipleShield = true
      $scope.detail.btnEnabled = false
      isShieldAll = false
      isAutoShield = false
      exec_sendCoin($scope.shieldAddresses[0], $scope.detail.privateAddr, 0, $scope.detail.fee, SendType.SHIELD)
    }
    else if(!isSynced)
    {
      spawnMessage(MsgType.ALERT, 'Your wallet is not synced')
    }
  }

  function continueShield(from, to, fee)
  {
    //if($scope.detail.lastBestTime != $scope.detail.bestTime)
    {
      clearInterval(continueShieldTimer)
      continueShieldTimer = undefined
      exec_sendCoin(from, to, 0, fee, SendType.SHIELD)
    }
    // else
    // {
    //   if(continueShieldTimer == undefined)
    //   {
    //     continueShieldTimer = setInterval(function(){
    //       continueShield(from, to, fee)
    //     },2000)
    //   }
    // }
  }
  $scope.selectPubAddress = function(addr){
    $scope.detail.publicAddr = addr
  }

  $scope.selectPrivAddress = function(addr){
    $scope.detail.privateAddr = addr
  }

  $scope.shieldClick = function(){
    isAutoShield = false
    if($scope.detail.publicAddr == undefined)
    {
      writeLog("send address = null")
      spawnMessage(MsgType.ALERT, 'Please select send address')
      return undefined
    }

    if($scope.detail.privateAddr == undefined || $scope.detail.privateAddr == '')
    {
      writeLog("recipient address = null")
      spawnMessage(MsgType.ALERT, 'Please put receiver address')
      return undefined
    }

    if($scope.detail.fee == undefined || $scope.detail.fee == '')
    {
      writeLog("fee = null")
      spawnMessage(MsgType.ALERT, 'Please put transaction fee')
      return undefined
    }

    $scope.detail.btnEnabled = false
    isShieldAll = false
    exec_sendCoin($scope.detail.publicAddr, $scope.detail.privateAddr, 0, String($scope.detail.fee).replace(',','.'), SendType.SHIELD)
  }

  $scope.shieldAllClick = function()
  {
    isAutoShield = false
    if($scope.detail.privateAddr == undefined || $scope.detail.privateAddr == '')
    {
      writeLog("recipient address = null")
      spawnMessage(MsgType.ALERT, 'Please put receiver address')
      return undefined
    }

    if($scope.detail.fee == undefined || $scope.detail.fee == '')
    {
      writeLog("fee = null")
      spawnMessage(MsgType.ALERT, 'Please put transaction fee')
      return undefined
    }

    spawnMessage(MsgType.CONFIRMATION, 'Do you want to shield all generated coin to ' + $scope.detail.privateAddr, 'Are you sure?')
  }

  $scope.shieldAllAction = function(){
    if($scope.publicAddresses.length > 0)
    {
      $scope.detail.btnEnabled = false
      isShieldAll = true
      exec_sendCoin('*', $scope.detail.privateAddr, 0, String($scope.detail.fee).replace(',','.'), SendType.SHIELD)
    }
    else
    {
      spawnMessage(MsgType.ALERT, "No coin to shield")
    }
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  electron.ipcRenderer.on('child-update-shield', function(event, msgData){
    var data = msgData.msg
    // writeLog(data)
    populateAddress(data)
  })

  electron.ipcRenderer.on('child-shield-coin', function(event, msgData){
    var data = msgData.msg.value
    // writeLog(data)
    $timeout(function(){
      if(data.result == null)
      {
        if(!isShieldAll)
        {
          if(!isMultipleShield)
          {
            spawnMessage(MsgType.ALERT, data.error.message)
            $scope.detail.btnEnabled = true
          }
          else
          {
            if(data.error.code == -6 && $scope.shieldAddresses.length > 0)
            {
              $scope.shieldAddresses.splice(0, 1)
              if($scope.shieldAddresses.length == 0)
              {
                $scope.detail.btnEnabled = true
                shouldGetAll = true
                var msg = "Multiple shield is done"
                spawnMessage(MsgType.ALERT, msg, "")
              }
              else
              {
                exec_sendCoin($scope.shieldAddresses[0], $scope.detail.privateAddr, 0, $scope.detail.fee, SendType.SHIELD)
              }
            }
          }
        }
        else 
        {
          if(data.error.code == -6 || $scope.detail.remainingvalue < 8)
          {
            $scope.detail.btnEnabled = true
            shouldGetAll = true
            isShieldAll = false
            if(!isAutoShield)
            {
              var msg = "Shield all is done"
              spawnMessage(MsgType.ALERT, msg, "")
            }
            else
            {
              var msg = "Shield all is done"
              sendBotReplyMsg(msg)
              writeLog("Auto shield is done")
            }
          }
          else
          {
            console.log(data)
          }
        }
      }
      else
      {
        checkTransaction(data.result.opid, SendType.SHIELD)
      }
    },0)
  })

  electron.ipcRenderer.on('child-check-transaction-shield', function(event, msgData){
    writeLog(msgData.msg)
    var data = msgData.msg
    $timeout(function(){
      if(data.result == null)
      {
        if(!isShieldAll && !isMultipleShield)
        {
          $scope.detail.btnEnabled = true
          if(!isAutoShield)
          {
            spawnMessage(MsgType.ALERT, "Check transaction error")
          }
          else
          {
            var msg = "Check transaction error"
            sendBotReplyMsg(msg)
            writeLog(msg)
          }
        }
      }
      else
      {
        //send done, check status
        var element = data.result[0]
        var status = element.status
        writeLog(status)
        if(status == "executing")
        {
          setTimeout(function(){
            checkTransaction(element.id, SendType.SHIELD)
            //update sending process
          }, 2000);
        }
        else if(status == "success")
        {
          if(isShieldAll)
          {
            if($scope.detail.remainingvalue < 8)
            {
              $scope.detail.btnEnabled = true
              shouldGetAll = true
              isShieldAll = false
              if(!isAutoShield)
              {
                var msg = "Shield all is done"
                spawnMessage(MsgType.ALERT, msg, "")
              }
              else
              {
                var msg = "Shield all is done"
                sendBotReplyMsg(msg)
                writeLog("Auto shield is done")
              }
            }
            else
            {
              $scope.detail.lastBestTime = $scope.detail.bestTime
              continueShield('*', $scope.detail.privateAddr, String($scope.detail.fee).replace(',','.'))
            }
          }
          else
          {
            if(isMultipleShield)
            {
              if($scope.shieldAddresses.length > 0)
              {
                $scope.shieldAddresses.splice(0, 1)
                if($scope.shieldAddresses.length == 0)
                {
                  $scope.detail.btnEnabled = true
                  shouldGetAll = true
                  spawnMessage(MsgType.ALERT, "Multiple shield is done", "")
                }
                else
                {
                  $scope.detail.lastBestTime = $scope.detail.bestTime
                  continueShield($scope.shieldAddresses[0], $scope.detail.privateAddr, String($scope.detail.fee).replace(',','.'))
                }
              }
            }
            else
            {
              $scope.detail.btnEnabled = true
              shouldGetAll = true
              spawnMessage(MsgType.ALERT, "Success", "")
            }
          }
          shouldGetAll = true
        }
        else
        {
          if(isShieldAll)
          {
            $scope.detail.lastBestTime = $scope.detail.bestTime
            continueShield('*', $scope.detail.privateAddr, String($scope.detail.fee).replace(',','.'))
          }
          else
          {
            $scope.detail.btnEnabled = true
            spawnMessage(MsgType.ALERT, element)
          }
        }
      }
    },0)
  })

  electron.ipcRenderer.on('child-execute-shield-all', function(event, msgData){
    writeLog(msgData.msg)
    if(msgData.msg.isBot == true)
    {
      $timeout(function(){
        autoShield(msgData.msg.shieldthreshold, msgData.msg.shieldaddress)
        //update sending process
      }, 0)
    }
    else
    {
      setInterval(function(){
        autoShield(msgData.msg.shieldthreshold, msgData.msg.shieldaddress)
        //update sending process
      }, 60000)
    }
  })

  electron.ipcRenderer.on('child-execute-multiple-shield', function(event, msgData){
    writeLog(msgData.msg)
    $scope.shieldAddresses = msgData.msg.shieldAddress
    multipleShield(msgData.msg.privateAddr)
      //update sending process
  })

  electron.ipcRenderer.on('child-update-locked-coin', function(event, msgData){
    $timeout(function(){
      $scope.detail.remainingvalue = msgData.msg
    })
  })
  
  electron.ipcRenderer.on('child-update-loading', function(event, msgData) {
    var data = msgData.msg
    $timeout(function(){
      $scope.detail.bestTime = data.besttime == undefined ? -1 : data.besttime
    },0)
  })
}])
app.controller('TransactionsCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.transactions = []
  $scope.detail = {}
  $scope.visible = false
  $scope.transactionData
  function updateTransactions(arg){
    var data = arg.data
    var count = 1
    // writeLog(JSON.stringify(data))
    $timeout(function(){
      if($scope.transactions.length == 0 || $scope.transactions[0].key != data[0].txid || $scope.transactions[0].confirmations != data[0].confirmations)
      {
        ipc.send('main-update-transactions-time', arg)
        $scope.transactions = []

        data.some(function(element){
          var temp = {}
          temp['no'] = count
          temp['direction'] = $scope.directionClass = element.category
          temp['date'] = timeConverter(element.time)
          temp['address'] = element.address != undefined ? element.address : 'Private address'
          temp['amount'] = Math.abs(element.amount)
          if(element.category != "generate")
          {
            temp['validated'] = element.confirmations >= 5 ? 'Yes' : 'No (' + element.confirmations + ')'
          }
          else
          {
            temp['validated'] = element.confirmations >= 100 ? 'Yes' : 'Immature (' + element.confirmations + ')'
          }
          temp['confirmations'] = element.confirmations
          temp['value'] = element
          temp['key'] = element.txid

          $scope.transactions.push(temp)
          count += 1
          // if(count > 100)
          //   return true
        })
      }
      transactions = $scope.transactions
    },0)
  }

  $scope.viewDetail = function(data)
  {
    $scope.transactionData = JSON.stringify(data, null, 2)
    var txhash = data.txid
    $scope.detail.txurl = (serverData.explorer.endsWith('/') ? serverData.explorer : serverData.explorer + '/') + txhash
    $("#txModal").modal()
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  electron.ipcRenderer.on('child-update-transactions', function(event, msgData){
    updateTransactions(msgData.msg)
  })

}])
app.controller('SettingsCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
  $scope.detail = {}
  $scope.privateAddresses = []
  $scope.privateAddressesTemp = []
  $scope.detail.btnEnabled = false
  var debugList = []
  $scope.detail.debugdata = ''
  $scope.detail.datetime = 0
  $scope.detail.transactionstime = 0
  $scope.detail.showTransactionTime = false
  $scope.detail.datetimeType = [
    {
      "key": "YYYY/MM/DD",
      "value": 1
    },
    {
      "key": "DD/MM/YYYY",
      "value": 2
    }
  ]

  $scope.detail.transactionsType = [
    {
      "key": "Day",
      "value": 1
    },
    {
      "key": "Week",
      "value": 2
    },
    {
      "key": "Month",
      "value": 3
    },
    {
      "key": "Quarter",
      "value": 4
    },
    {
      "key": "Year",
      "value": 5
    }
  ]

  $scope.detail.bottype = [
    "Do not use",
    "Discord"
  ]

  function spawnMessage(type, text, btn, title)
  {
    var arg = [ScreenType.SETTINGS, false]
    electron.ipcRenderer.send('main-show-screen', arg)
    $timeout(function(){
      $scope.detail.title = title == undefined ? "Alert!!!" : title
      $scope.detail.text = text
      $scope.detail.btn = btn
      if(type == MsgType.CONFIRMATION)
      {
        $('#restartWallet').modal()
      }
      else if(type == MsgType.CONFIRMATION2)
      {
        $('#restartWallet2').modal()
      }
      else if(type == MsgType.DEFAULT_SETTINGS)
      {
        $('#defaultSettings').modal()
      }
      else if(type == MsgType.ALERT)
      {
        $('#alertSettings').modal()
      }
      else if(type == MsgType.ADD_PEERS)
      {
        $('#addPeersSettings').modal()
      }
      else if(type == MsgType.DEBUG)
      {
        $('#debugSettings').modal()
      }
      else if(type == MsgType.GET_PEERS)
      {
        $('#getPeersSettings').modal()
      }
    },0)
  }

  function readSettingsLocal()
  {
    var temp = {}
    temp['daemon'] = $scope.detail.daemon
    temp['autoupdatedaemon'] = $scope.detail.autoupdatedaemon
    temp['background'] = $scope.detail.backgroundLocation
    temp['autostart'] = $scope.detail.autostart
    temp['enablelog'] = $scope.detail.enablelog
    temp['currency'] = $scope.detail.currency
    temp['symbol'] = $scope.detail.symbol
    temp['transactionschart'] = $scope.detail.transactionschart
    temp['datafolder'] = $scope.detail.dataLocation
    temp['closeminimize'] = $scope.detail.closeminimize
    temp['autoshield'] = $scope.detail.autoshield
    temp['shieldthreshold'] = $scope.detail.shieldthreshold
    temp['shieldaddress'] = $scope.detail.shieldaddress
    temp['hidezeroaddress'] = $scope.detail.hidezeroaddress
    temp['datetime'] = $scope.detail.datetime
    temp['transactionstime'] = $scope.detail.transactionstime
    if($scope.detail.bot == "Discord" || $scope.detail.bot == "Telegram")
    {
      temp['bot'] = $scope.detail.bot
      temp['apikey'] = $scope.detail.apikey
      temp['botname'] = $scope.detail.botname
    }
    return temp
  }

  function populateSettings(settings)
  {
    $timeout(function(){
      $scope.detail.daemon = settings.daemon
      $scope.detail.autoupdatedaemon = settings.autoupdatedaemon
      $scope.detail.dataLocation = settings.datafolder
      $scope.detail.backgroundLocation = settings.background
      $scope.detail.autostart = settings.autostart
      $scope.detail.enablelog = settings.enablelog
      $scope.detail.transactionschart = settings.transactionschart
      $scope.detail.closeminimize = settings.closeminimize
      if(settings.currency == undefined)
      {
        $scope.detail.currency = 'USD'
        $scope.detail.symbol = '$'
      }
      else
      {
        $scope.detail.currency = settings.currency
        $scope.detail.symbol = settings.symbol
      }
      $scope.detail.coins = coinList.coins
      $scope.detail.autoshield = settings.autoshield
      if(settings.shieldaddress != undefined)
      {
        var index = $scope.privateAddresses.findIndex(function(e){return e.text == settings.shieldaddress})
        if(index == -1)
        {
          var temp = {}
          temp['text'] = settings.shieldaddress
          temp['value'] = settings.shieldaddress
          $scope.privateAddresses.push(temp)
        }
      }
      $scope.detail.shieldaddress = settings.shieldaddress
      $scope.detail.shieldthreshold = settings.shieldthreshold
      $scope.detail.hidezeroaddress = settings.hidezeroaddress
      if(settings.datetime != undefined)
      {
        $scope.detail.datetime = settings.datetime
      }
      else
      {
        $scope.detail.datetime = "1"
      }
      if(settings.transactionstime != undefined)
      {
        $scope.detail.transactionstime = settings.transactionstime
      }
      else
      {
        $scope.detail.transactionstime = "1"
      }
      if(settings.bot != undefined)
      {
        $scope.detail.bot = settings['bot']
        $scope.detail.apikey = settings['apikey']
        $scope.detail.botname = settings['botname']
      }
    },0)
  }

  $scope.openDaemon = function(){
    var dialogOptions;
    if(process.platform == 'win32')
    {
        dialogOptions= {
            filters: [
                { name: serverData.daemon, extensions: ["exe"] },
            ],
            properties: ["openFile"]
        }
    }
    else if(process.platform == 'linux' || process.platform == 'darwin')
    {
        dialogOptions= {
          filters: [
            { name: serverData.daemon},
          ],
            properties: ["openFile"]
        }
    }
    dialog.showOpenDialog(dialogOptions, function (fileNames) {
        if(fileNames === undefined){
          writeLog("No file selected");
        }else{
          $timeout(function(){
            $scope.detail.daemon = fileNames[0].replace(/\\/g, "/");
          },0)
        }
    })
  }


  $scope.openCli = function(){
    var dialogOptions;
    if(process.platform == 'win32')
    {
        dialogOptions= {
            filters: [
                { name: serverData.cli, extensions: ["exe"] },
            ],
            properties: ["openFile"]
        }
    }
    else if(process.platform == 'linux' || process.platform == 'darwin')
    {
        dialogOptions= {
          filters: [
            { name: serverData.cli },
            ],
            properties: ["openFile"]
        }
    }
    dialog.showOpenDialog(dialogOptions, function (fileNames) {
        if(fileNames === undefined){
          writeLog("No file selected");
        }else{
          $timeout(function(){
            $scope.detail.cli = fileNames[0].replace(/\\/g, "/");
          },0)
        }
    })
  }

  $scope.openDataLocation = function(){
    $scope.detail.disableSelectDirectory = true
    var dialogOptions = {
      properties: ["openDirectory"]
    }
    dialog.showOpenDialog(dialogOptions, function (folder) {
      $timeout(function(){
        $scope.detail.disableSelectDirectory = false
        if(folder === undefined){
          writeLog("No folder selected");
        }else{
          document.getElementById("data-dir").value = $scope.detail.dataLocation = folder[0];
        }
      }, 0)
    })
  }

  $scope.openBackground = function(){
    var dialogOptions = {
        filters: [
          {name: 'Images', extensions: ['jpg', 'png', 'gif']},
        ],
        properties: ["openFile"]
    }
    dialog.showOpenDialog(dialogOptions, function (fileNames) {
        if(fileNames === undefined){
          writeLog("No file selected");
        }else{
          $timeout(function(){
            $scope.detail.backgroundLocation = fileNames[0].replace(/\\/g, "/");
          },0)
        }
    })
  }

  $scope.faq = function(){
    shell.openExternal('https://snowgem.org/faq')
  }

  $scope.valueChange = function(value){
    $scope.detail.currency = value

    var index = $scope.detail.price.findIndex(function(e){return e.code == value})
    if(index > -1)
    {
      $scope.detail.symbol = $scope.detail.price[index].symbol
      writeLog($scope.detail.symbol)
    }
    else
    {
      $scope.detail.symbol = '*'
    }
  }

  $scope.botTypeChange = function(){
    //$scope.detail.currency = value
    if($scope.detail.bot == "Discord" || $scope.detail.bot == "Telegram")
    {
      $scope.detail.apiKey = settings[$scope.detail.bot] == undefined ? "" : settings[$scope.detail.bot]
    }
  }

  $scope.botNamePress = function(event){
    if (event.keyCode === 32)
    {
      alert('No space for bot name');
      event.preventDefault()
    }
  }

  $scope.applyClick = function(){
    var data = readSettingsLocal()
    if(data.bot != undefined)
    {
      if(data.botname == undefined || data.botname == "")
      {
        spawnMessage(MsgType.ALERT, "Bot name could not be empty", "Failed!!!")
        return
      }
      else if(data.apikey == undefined || data.apikey == "")
      {
        spawnMessage(MsgType.ALERT, "API key could not be empty", "Failed!!!")
        return
      }
    }
    saveSettings(data, $scope.detail.currentCoin)
    var currData = {}
    writeLog($scope.detail.currentCoin)
    currData["coinname"] = $scope.detail.currentCoin
    saveCurrentCoin(JSON.stringify(currData))
    //restart wallet
    if(currentCoin != $scope.detail.currentCoin)
    {
      spawnMessage(MsgType.CONFIRMATION2, "You have to restart wallet to change coin. Please wait until wallet is reloaded", "Restart", "")
    }
    else
    {
      spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new changes", "Restart", "Do you want to restart wallet?")
    }
  }

  $scope.cancelClick = function(){
    writeLog('populateSettings')
    $scope.privateAddresses = $scope.privateAddressesTemp
    scope.detail.currentCoin = currentCoin
    populateSettings(settings)

    // var arg = ["help"]
    // startCli(arg)
  }

  $scope.defaultClick = function(){
    spawnMessage(MsgType.DEFAULT_SETTINGS, "Revert to default settings?", "OK", "Are you sure?")
  }

  $scope.restartAction = function(){
    //check wallet status
    helpData = undefined
    setTimeout(walletStatusTimerFunction, 500)
  }

  $scope.defaultAction = function(){
    var loc = getWalletHome(false, currentCoin) + "/settings.json"
    writeLog("remove old settings " + loc)
    if(fs.existsSync(loc))
    {
      writeLog("remove old settings")
      fs.unlinkSync(loc); 
    }
    spawnMessage(MsgType.CONFIRMATION, "Restart wallet to apply new changes", "Restart", "Do you want to restart wallet?")
  }

  function walletStatusTimerFunction(){
    // writeLog(helpData)
    stopWallet()
    checkWallet()
    if(helpData != null  && helpData != undefined)
    {
      if (helpData.result == null && helpData.errno != undefined)
      {
        //refresh wallet
        var arg = []
        electron.ipcRenderer.send('main-reload', arg)
      }
      else
      {
        setTimeout(walletStatusTimerFunction, 500)
      }
    }
    else
    {
      setTimeout(walletStatusTimerFunction, 500)
    }
  }

  function restoreWalletStatusTimerFunction(file){
    // writeLog(helpData)
    stopWallet()
    checkWallet()
    if(helpData != null  && helpData != undefined)
    {
      if (helpData.result == null && helpData.errno != undefined)
      {
        //refresh wallet
        var walletLocation = getUserHome(serverData, settings);
        if(fs.existsSync(walletLocation + '/wallet.dat'))
        {
          fsextra.move(walletLocation + '/wallet.dat', walletLocation  + '/wallet.dat.' + Math.round((new Date()).getTime() / 1000), function (err) {
            if (err) return console.error(err)
            moveWallet(file)
          })
        }
        else
        {
          moveWallet(file)
        }

        function moveWallet(dir)
        {
          fsextra.copySync(dir, walletLocation + '/wallet.dat');
          var arg = []
          electron.ipcRenderer.send('main-reload', arg)
        }
      }
      else
      {
        setTimeout(restoreWalletStatusTimerFunction, 500, file)
      }
    }
    else
    {
      setTimeout(restoreWalletStatusTimerFunction, 500, file)
    }
  }

  function populateAddress(data){
    var walletDic = data.from
    var keys = Object.keys(walletDic)
    $timeout(function(){
      $scope.privateAddresses = []
      keys.forEach(function(element){
        var temp = {}
        temp['text'] = element + " - " + walletDic[element].amount
        temp['value'] = element.split(' (')[0]
        if(element.startsWith('z'))
        {
          var index = $scope.privateAddresses.findIndex(function(e){return e.text.split(' - ')[0] === temp.text.split(' - ')[0]})
          if (index == -1) {
            $scope.privateAddresses.push(temp)
          }
          else
          {
            if($scope.privateAddresses[index].text.split(' - ')[1] != temp.text.split(' - ')[1])
            {
              $scope.privateAddresses[index].text = temp.text
            }
          }
        }
      })
      $scope.detail.btnEnabled = true
    },0)
  }

  $scope.getPeers = function(){
    getPeerInfo()
  }

  $scope.addPeers = function(){
    spawnMessage(MsgType.ADD_PEERS, '', '', "Add Peers")
  }

  $scope.backupClick = function(){
    var dialogOptions;

    {
        dialogOptions= {
            filters: [
                { name: '', extensions: ["dat"] },
            ],
            properties: ["openFile"]
        }
    }
    dialog.showSaveDialog(dialogOptions, function (fileName) {
      var walletLocation = getUserHome(serverData, settings);
        if(fs.existsSync(walletLocation + '/wallet.dat'))
        {
          fsextra.copySync(walletLocation + '/wallet.dat', fileName);
          spawnMessage(MsgType.ALERT, "Wallet has been backed up to: " + fileName, "Success!!!")
        }
        else
        {
          spawnMessage(MsgType.ALERT, "Cannot backup wallet", "Failed!!!")
        }
    })
  }

  $scope.restoreClick = function(){
    var dialogOptions;

    {
        dialogOptions= {
            filters: [
                { name: serverData.daemon, extensions: ["dat"] },
            ],
            properties: ["openFile"]
        }
    }
    
    dialog.showOpenDialog(dialogOptions, function (fileNames) {
        if(fileNames === undefined){
          writeLog("No file selected");
        }else{
          spawnMessage(MsgType.ALERT, "Backing up wallet, please wait until it's reloaded")
          setTimeout(restoreWalletStatusTimerFunction, 500, fileNames[0].replace(/\\/g, "/"))
        }
    })
  }

  $scope.rescanClick = function(){
    var walletHome = getWalletHome(true)
    fs.writeFileSync(walletHome + "/commands.txt", '-rescan')
    spawnMessage(MsgType.CONFIRMATION, "Restart wallet to rescan wallet", "Restart", "Do you want to restart wallet?")
  }

  $scope.reindexClick = function(){
    var walletHome = getWalletHome(true)
    fs.writeFileSync(walletHome + "/commands.txt", '-reindex')
    spawnMessage(MsgType.CONFIRMATION, "Restart wallet to rescan wallet", "Restart", "Do you want to restart wallet?")
  }

  $scope.addPeersAction = function(data){
    var file = getUserHome(serverData, settings) + "/" + serverData.conf_file
    fs.appendFileSync(file, data)
    detail.peersList = ""
    spawnMessage(MsgType.CONFIRMATION, "Restart wallet to reindex wallet", "Restart", "Do you want to restart wallet?")
  }

  $scope.debug = function(){
    spawnMessage(MsgType.DEBUG, '', '', '')
  }

  $scope.selectCoin = function(coin){
    var settings = readSettings(coin)
    if(settings.enablelog == undefined)
    {
      settings.enablelog = true
    }
    if(settings.showTransactionTime == undefined)
    {
      settings.showTransactionTime = false
    }
    if(coin != currentCoin)
    {
      $scope.privateAddressesTemp = $scope.privateAddresses
      $scope.privateAddresses = []
    }
    else
    {
      $scope.privateAddresses = $scope.privateAddressesTemp
    }
    populateSettings(settings)
    $scope.detail.currentCoin = coin
  }

  $scope.startDebugging = function(event){
    event.preventDefault()
    if (event.keyCode === 13) {
      $scope.detail.debugdata += $scope.detail.debugcommand + '\n'
      getDebug($scope.detail.debugcommand)
      debugList.push($scope.detail.debugcommand)
      $scope.detail.debugcommand = undefined
    }
  }

  $scope.dateChange = function(date){
    console.log(date)
  }

  electron.ipcRenderer.on('child-get-peer-info', function(event, msgData){
    var data = msgData.msg.result
    var peers = '\n'
    data.forEach(function(element){
      peers += "addnode=" + element.addr + '\n'
    })

    spawnMessage(MsgType.GET_PEERS, peers, '', "Peers List")
  })

  electron.ipcRenderer.on('child-update-settings', function(event, msgData){
    writeLog('populateSettings')
    $timeout(function(){
      if(msgData.msg[2] != null && msgData.msg[2] != undefined)
      {
        $scope.detail.currentCoin = currentCoin
      }
      if(settings != null && settings != undefined)
      {
        populateSettings(settings)
      }
    },0)
  })

  electron.ipcRenderer.on('child-get-debug', function(event, msgData){
    $timeout(function(){
      if(msgData.msg.result != null)
      {
        $scope.detail.debugdata += (typeof msgData.msg.result === 'string' ? msgData.msg.result : JSON.stringify(msgData.msg.result, null, 2)) + '\n\n'
      }
      else
      {
        $scope.detail.debugdata += msgData.msg.error.message + '\n\n'
      }
    },0)
  })

  electron.ipcRenderer.on('child-update-price', function(event, msgData) {
    $timeout(function(){
      $scope.detail.price = JSON.parse(msgData.msg)
    },0)
  })

  electron.ipcRenderer.on('child-update-shield', function(event, msgData){
    var data = msgData.msg
    // writeLog(data)
    if($scope.detail.currentCoin == currentCoin)
    {
      populateAddress(data)
    }
  })

  var PositionTextAreaToBottom = function() {
      textArea.scrollTop = textArea.scrollHeight;
  }

  electron.ipcRenderer.on('child-update-settings', function(event, msgData){
    $timeout(function(){
      if(msgData.msg[2] != null && msgData.msg[2] != undefined)
      {
        $scope.detail.showTransactionTime = msgData.msg[2].cointype == "snowgem" ? true : false
      }
    },0)
  })
}])
