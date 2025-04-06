import React from 'react';
import { Button } from '../ui/button'; // Import Button

interface FooterProps {
    onLinkClick: (link: string) => void;
}

export function Footer({ onLinkClick }: FooterProps) {
  const renderLink = (text: string) => (
    <Button
      variant="link"
      className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
      onClick={() => onLinkClick(text)}
    >
      {text}
    </Button>
  );

  return (
    <footer className="border-t border-border/60 bg-background/50 backdrop-blur-sm py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">AQMatic</h3>
            <p className="text-muted-foreground text-sm">
              Supporting Saudi Vision 2030 with advanced environmental
              monitoring solutions.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li>{renderLink("Features")}</li>
              <li>{renderLink("Pricing")}</li>
              <li>{renderLink("API")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>{renderLink("Documentation")}</li>
              <li>{renderLink("Blog")}</li>
              <li>{renderLink("Support")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>{renderLink("Twitter")}</li>
              <li>{renderLink("LinkedIn")}</li>
              <li>{renderLink("Contact Us")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 AQMatic. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {renderLink("Privacy")}
            {renderLink("Terms")}
            {renderLink("Cookies")}
          </div>
        </div>
      </div>
    </footer>
  );
}
