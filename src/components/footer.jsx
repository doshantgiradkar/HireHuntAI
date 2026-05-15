import { Sparkles } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
			 <footer className="bg-[oklch(0.18_0.012_262)] text-[oklch(0.92_0.009_255)] py-12 pb-28">
									<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col items-center justify-center text-center md:flex-row md:items-start md:justify-between md:text-left">
                        <div className="mb-8 md:mb-0">
                            <div className="flex items-center justify-center space-x-2 mb-4 md:justify-start">
                                <span className="text-xl font-bold">HireHunt AI</span>
                            </div>
                            <p className="text-[oklch(0.73_0.014_252)] mb-4 max-w-md">
                                Transform your hiring process with AI-powered interview management.
                                Make better hiring decisions faster.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold mb-4">Product</h3>
                                <ul className="space-y-2 text-[oklch(0.73_0.014_252)]">
                                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">Company</h3>
                                <ul className="space-y-2 text-[oklch(0.73_0.014_252)]">
                                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[oklch(0.31_0.012_260)] pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-[oklch(0.73_0.014_252)] text-sm mb-4 md:mb-0">
                            © 2025 Agentic Interview. All rights reserved.
                        </div>
                        <div className="flex space-x-6 text-[oklch(0.73_0.014_252)] text-sm">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
  )
}

export default Footer
