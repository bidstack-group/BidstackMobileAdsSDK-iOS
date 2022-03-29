Pod::Spec.new do |spec|

  spec.name         = "BidstackMobileAdsSDK"
  spec.version      = "1.0.0"
  spec.summary      = "BidstackMobileAdsSDK — Bidstack ads player."

  spec.description  = <<-DESC
			  Bidstack VAST player. Mode details soon.
		      DESC

  spec.homepage     = "https://bidstack.com"

  spec.license      = { :type => 'New BSD', :file => 'LICENSE.TXT' }

  spec.author       = { "Alexey Volkov" => "aleksejs.volkovs@bidstack.com" }
  spec.platform     = :ios, "10.0"
  spec.swift_version = '5.0'
                                   
  spec.source       = { :git => "https://github.com/bidstack-group/BidstackMobileAdsSDK-iOS.git", :tag => "v#{spec.version}" }
  
  spec.vendored_frameworks = "BidstackMobileAdsSDK.xcframework"
 	
end
