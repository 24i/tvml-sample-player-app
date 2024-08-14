//
//  AppDelegate.swift
//  fokusOnTVOSJSPlayerDemo
//  Created by Vladimir Sánchez Mondeja on 28/6/23.
//

import TVMLKit
import UIKit


// MARK: UIApplicationDelegate
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    var appController: TVApplicationController?
    var appHost: AppHost?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        /// Override point for customization after application launch.
        window = UIWindow(frame: UIScreen.main.bounds)
        
        /// Read the `tvAppHost.plist` configuration file containig the entry point of the Javascript Application
        appHost = fetchTVAppHost()
        
        /// Create the TVApplicationControllerContext for this application and set the properties that will be passed
        /// to the `App.onLaunch` function in JavaScript.
        let appControllerContext = TVApplicationControllerContext()
        
        if let hostUrl = appHost?.host ,let path = appHost?.path,
           let javaScriptURL = URL(string: "\(hostUrl)/\(path)") {
            appControllerContext.javaScriptApplicationURL = javaScriptURL
            appControllerContext.launchOptions["BASEURL"] = hostUrl as NSString
        }
        
        /// Pass the launch optons from `AppDelgate` to the `TVApplicationControllerContext` launch options
        if let launchOptions = launchOptions {
            for (kind, value) in launchOptions {
                appControllerContext.launchOptions[kind.rawValue] = value
            }
        }
        
        /// Create the TVAplicationController with the current windows object and assign the `AppDelegate`as TVApplicationControllerDelegate
        appController = TVApplicationController(context: appControllerContext, window: window, delegate: self)
        
        return true
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
    }
}

// MARK: TVApplicationControllerDelegate
extension AppDelegate: TVApplicationControllerDelegate {
    
    func appController(_ appController: TVApplicationController, didFinishLaunching options: [String: Any]?) {
        Logger.log(level: .debug, message:"TVApplicationController didFinishLaunching with options: \(options ?? [:])")
    }
    
    func appController(_ appController: TVApplicationController, didFail error: Error) {
        Logger.log(level: .error, message:"TVApplicationController didFail with error: \(error)")
        
        let title = "Error Launching Application"
        let message = error.localizedDescription
        let alertController = UIAlertController(title: title, message: message, preferredStyle: .alert )
        
        self.appController?.navigationController.present(alertController, animated: true, completion: {
            // ...
        })
    }
    
    func appController(_ appController: TVApplicationController, didStop options: [String: Any]?) {
        Logger.log(level: .debug, message:"TVApplicationController didStop with options: \(options ?? [:])")
    }
}

