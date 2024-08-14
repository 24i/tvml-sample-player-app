//
//  AppHost.swift
//  fokusOnTVOSJSPlayerDemo
//
//  Created by Vladimir Sánchez Mondeja on 28/6/23.
//

import Foundation

struct AppHost:Decodable {
    let host: String
    let path: String
}


func fetchTVAppHost() -> AppHost? {
    
    guard let url = Bundle.main.url(forResource: "tvAppHost", withExtension: "plist"), let data = try? Data(contentsOf: url) else {
        fatalError("Unable to load the tvAppHost configuration file")
    }
    do {
        let decoder = PropertyListDecoder()
        let appHost = try decoder.decode(AppHost.self, from: data)
        return appHost
    } catch {
        fatalError("Unable to parse the tvAppHost.plist configuration file")
    }
}

