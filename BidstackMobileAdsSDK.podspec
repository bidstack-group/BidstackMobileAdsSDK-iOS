Pod::Spec.new do |spec|

  spec.name         = "BidstackMobileAdsSDK"
  spec.version      = "1.9.1"
  spec.summary      = "Bidstack Mobile Ads SDK."

  spec.description  = <<-DESC
			  The Bidstack Mobile Ads SDK is a VAST player 2.0 with networking layer that allows to play back video advertising for Bidstack custom adapter.
		      DESC

  spec.homepage     = "https://bidstack.com"

  spec.license      = { :type => 'MIT', :file => 'LICENSE' }

  spec.author       = "Bidstack Limited"
  spec.platform     = :ios, "11.0"
  spec.swift_version = '5.0'
  
  spec.pod_target_xcconfig = { 'VALID_ARCHS[sdk=iphoneos*]' => 'arm64', 'VALID_ARCHS[sdk=iphonesimulator*]' => 'x86_64 arm64', 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386' }
                                   
  spec.source       = { :git => "https://github.com/bidstack-group/BidstackMobileAdsSDK-iOS.git", :tag => "v#{spec.version}" }
  
  spec.vendored_frameworks = "BidstackMobileAdsSDK.xcframework", "Frameworks/*.xcframework"
 	
end
