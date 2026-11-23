"""
Módulo de Web Scraping Ético y Auditoría de Datos
Verifica robots.txt y consulta las fuentes de Football-Data.co.uk para Primera División de España (SP1).
"""
import urllib.robotparser
import urllib.request
import requests
from bs4 import BeautifulSoup
from typing import Dict, Any, List
import os

FOOTBALL_DATA_BASE = "https://www.football-data.co.uk"
SPAIN_DATA_URL = f"{FOOTBALL_DATA_BASE}/spainm.php"
ROBOTS_TXT_URL = f"{FOOTBALL_DATA_BASE}/robots.txt"

class FootballDataScraper:
    def __init__(self, user_agent: str = "SportsAnalyticsResearchBot/1.0 (+academic-project)"):
        self.user_agent = user_agent
        self.headers = {"User-Agent": self.user_agent}
        self.rp = urllib.robotparser.RobotFileParser()
        self.rp.set_url(ROBOTS_TXT_URL)
        self._robots_loaded = False

    def check_robots_permission(self, target_url: str = SPAIN_DATA_URL) -> bool:
        """Verifica si robots.txt permite acceder a la URL objetivo."""
        try:
            if not self._robots_loaded:
                self.rp.read()
                self._robots_loaded = True
            return self.rp.can_fetch(self.user_agent, target_url)
        except Exception as e:
            # En caso de no poder conectar a robots.txt, asumir permiso por defecto para investigación ética
            return True

    def get_source_status(self) -> Dict[str, Any]:
        """Obtiene el estado de conexión y auditoría con la fuente oficial."""
        can_fetch = self.check_robots_permission(SPAIN_DATA_URL)
        status_info = {
            "source_name": "Football-Data.co.uk (La Liga SP1)",
            "base_url": FOOTBALL_DATA_BASE,
            "target_url": SPAIN_DATA_URL,
            "robots_txt_url": ROBOTS_TXT_URL,
            "robots_allowed": can_fetch,
            "user_agent": self.user_agent,
            "status": "Online" if can_fetch else "Blocked by robots.txt",
            "available_seasons_found": []
        }
        
        try:
            resp = requests.get(SPAIN_DATA_URL, headers=self.headers, timeout=5)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                links = soup.find_all('a', href=True)
                seasons = []
                for a in links:
                    href = a['href']
                    if 'SP1.csv' in href:
                        seasons.append({
                            "season_text": a.text.strip() or href,
                            "csv_url": href if href.startswith("http") else f"{FOOTBALL_DATA_BASE}/{href.lstrip('/')}"
                        })
                status_info["available_seasons_found"] = seasons[:10]
                status_info["online_check"] = "Accessible (HTTP 200)"
            else:
                status_info["online_check"] = f"HTTP {resp.status_code}"
        except Exception as err:
            status_info["online_check"] = f"Offline / Error: {str(err)}"
            
        return status_info

if __name__ == "__main__":
    scraper = FootballDataScraper()
    print("Estado del Scraper:")
    print(scraper.get_source_status())
