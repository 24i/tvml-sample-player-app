//
//  Logger.swift
//  fokusOnMultiscreen
//
//  Created by nroos on 31/01/2016.
//  Copyright © 2016 Nordija A/S. All rights reserved.
//

public enum Level: Int {
    case verbose = 0
    case debug = 1
    case info = 2
    case warning = 3
    case error = 4

    var stringValue: String {
        switch self {
        case .verbose:
            return "💜 VERBOSE"
        case .debug:
            return "💚 DEBUG"
        case .info:
            return "💙 INFO"
        case .warning:
            return "💛 WARNING"
        case .error:
            return "❤️ ERROR"
        }
    }
}

public struct Logger {

    public static func verbose(_ message: String) {
        log(level: .verbose, message: message)
    }

    public static func debug(_ message: String) {
        log(level: .debug, message: message)
    }

    public static func info(_ message: String) {
        log(level: .info, message: message)
    }

    public static func warning(_ message: String) {
        log(level: .warning, message: message)
    }

    public static func error(_ message: String) {
        log(level: .error, message: message)
    }

    /// Printout the message depending on the scheme build configuration  selected.
    /// - Parameters:
    ///    - level: The log level selected.
    ///    - asset: The message that will be print .
    ///
    /// To change configuration go to  TargetName / Edit scheme / Run / Build Configuration  and select
    /// the build configuration need it.
    ///
    public static func log(level: Level, message: String) {
        var logLevel: Level = .debug
        #if !(DEBUG)
           logLevel = .error
        #endif

        if level.rawValue >= logLevel.rawValue {
            print("\(level.stringValue): \(message)")
        }
    }

}
