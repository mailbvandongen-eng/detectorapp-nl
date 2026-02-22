import { Menu, X, Info, Settings, LogOut, User, MapPin, Route, Type, Layers, Cloud, Landmark, Ruler, Pencil, Printer, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import { isCommercialMode } from '../../config/buildMode'
import { version } from '../../../package.json'

// Google logo SVG component
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}


export function HamburgerMenu() {
  const { user, loading, signInWithGoogle, logout } = useAuthStore()
  const { hamburgerMenuOpen, toggleHamburgerMenu, toggleInfoPanel, toggleSettingsPanel, toggleMonumentSearch, toggleChangelog } = useUIStore()
  const isOpen = hamburgerMenuOpen

  // Settings for font scale
  const menuFontScale = useSettingsStore(state => state.menuFontScale)
  const setMenuFontScale = useSettingsStore(state => state.setMenuFontScale)
  const showFontSliders = useSettingsStore(state => state.showFontSliders)
  const setShowFontSliders = useSettingsStore(state => state.setShowFontSliders)
  const showVondstButton = useSettingsStore(state => state.showVondstButton)
  const setShowVondstButton = useSettingsStore(state => state.setShowVondstButton)
  const showRouteRecordButton = useSettingsStore(state => state.showRouteRecordButton)
  const setShowRouteRecordButton = useSettingsStore(state => state.setShowRouteRecordButton)
  const showCustomPointLayers = useSettingsStore(state => state.showCustomPointLayers)
  const setShowCustomPointLayers = useSettingsStore(state => state.setShowCustomPointLayers)
  const showWeatherButton = useSettingsStore(state => state.showWeatherButton)
  const setShowWeatherButton = useSettingsStore(state => state.setShowWeatherButton)
  const showMeasureTool = useSettingsStore(state => state.showMeasureTool)
  const setShowMeasureTool = useSettingsStore(state => state.setShowMeasureTool)
  const showDrawTool = useSettingsStore(state => state.showDrawTool)
  const setShowDrawTool = useSettingsStore(state => state.setShowDrawTool)
  const showPrintTool = useSettingsStore(state => state.showPrintTool)
  const setShowPrintTool = useSettingsStore(state => state.setShowPrintTool)

  // Safe top position for mobile browsers (accounts for notch/status bar)
  const safeTopStyle = { top: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }

  const closeMenu = () => toggleHamburgerMenu()

  const handleInfoClick = () => {
    closeMenu()
    toggleInfoPanel()
  }

  const handleSettingsClick = () => {
    closeMenu()
    toggleSettingsPanel()
  }

  const handleMonumentSearchClick = () => {
    closeMenu()
    toggleMonumentSearch()
  }

  const handleChangelogClick = () => {
    closeMenu()
    toggleChangelog()
  }

  const handleLogin = () => {
    closeMenu()
    signInWithGoogle()
  }

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  // Check if commercial mode (hide route, weather, measure, draw)
  const isCommercial = isCommercialMode()

  // Calculate font size based on menuFontScale
  const baseFontSize = 13 * menuFontScale / 100

  return (
    <>
      {/* Hamburger Button - Blue when open */}
      <motion.button
        className={`fixed right-2 z-[800] w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm ${
          isOpen
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-white/90 hover:bg-white'
        }`}
        style={safeTopStyle}
        onClick={toggleHamburgerMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Menu"
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <Menu size={22} className="text-gray-600 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[799]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            {/* Menu Panel - positioned to the left of the hamburger button */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed right-[56px] z-[801] w-64 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[80vh]"
              style={{
                top: 'calc(max(0.5rem, env(safe-area-inset-top, 0.5rem)))',
                fontSize: `${baseFontSize}px`
              }}
            >
              {/* Header with title and font size slider - blue bg, white text */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-blue-500">
                <span className="font-medium text-white" style={{ fontSize: `${baseFontSize}px` }}>Menu</span>
                {showFontSliders && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-blue-200">T</span>
                    <input
                      type="range"
                      min="80"
                      max="130"
                      step="10"
                      value={menuFontScale}
                      onInput={(e) => setMenuFontScale(parseInt((e.target as HTMLInputElement).value))}
                      onChange={(e) => setMenuFontScale(parseInt(e.target.value))}
                      className="w-16 opacity-70 hover:opacity-100 transition-opacity"
                      title={`Tekstgrootte: ${menuFontScale}%`}
                    />
                    <span className="text-[11px] text-blue-200">T</span>
                  </div>
                )}
              </div>

              {/* Google Login / Profile Section - NO border when logged out */}
              {loading ? (
                <div className="px-3 py-4 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="px-3 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate" style={{ fontSize: '0.85em' }}>
                        {user.displayName || 'Gebruiker'}
                      </div>
                      <div className="text-green-600" style={{ fontSize: '0.7em' }}>
                        Cloud sync actief
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none bg-transparent"
                      title="Uitloggen"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full px-3 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-0 outline-none bg-transparent"
                >
                  <GoogleLogo size={18} />
                  <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Inloggen met Google</span>
                </button>
              )}

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleInfoClick}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-3 border-0 outline-none bg-transparent transition-colors text-gray-700 hover:bg-blue-50"
                  style={{ fontSize: '0.95em' }}
                >
                  <Info size={18} className="text-blue-500" />
                  <span>Info & handleiding</span>
                </button>

                <button
                  onClick={handleChangelogClick}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-3 border-0 outline-none bg-transparent transition-colors text-gray-700 hover:bg-blue-50"
                  style={{ fontSize: '0.95em' }}
                >
                  <List size={18} className="text-blue-500" />
                  <span>Wat is nieuw</span>
                </button>

                <button
                  onClick={handleMonumentSearchClick}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-3 border-0 outline-none bg-transparent transition-colors text-gray-700 hover:bg-purple-50"
                  style={{ fontSize: '0.95em' }}
                >
                  <Landmark size={18} className="text-purple-500" />
                  <span>Zoek in monumenten</span>
                </button>
              </div>

              {/* Toggle Options - all subtle gray icons, blue toggles */}
              <div className="py-1 border-t border-gray-100">
                {/* Vondst knop toggle */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Vondst knop</span>
                  </div>
                  <button
                    onClick={() => setShowVondstButton(!showVondstButton)}
                    className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                      showVondstButton ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                        showVondstButton ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Route knop toggle - hidden in commercial */}
                {!isCommercial && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Route size={18} className="text-gray-400" />
                      <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Route knop</span>
                    </div>
                    <button
                      onClick={() => setShowRouteRecordButton(!showRouteRecordButton)}
                      className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                        showRouteRecordButton ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          showRouteRecordButton ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Weerwidget toggle - hidden in commercial */}
                {!isCommercial && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud size={18} className="text-gray-400" />
                      <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Weerwidget</span>
                    </div>
                    <button
                      onClick={() => setShowWeatherButton(!showWeatherButton)}
                      className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                        showWeatherButton ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          showWeatherButton ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Mijn lagen toggle */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers size={18} className="text-gray-400" />
                    <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Mijn lagen</span>
                  </div>
                  <button
                    onClick={() => setShowCustomPointLayers(!showCustomPointLayers)}
                    className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                      showCustomPointLayers ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                        showCustomPointLayers ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Meetgereedschap toggle - hidden in commercial */}
                {!isCommercial && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ruler size={18} className="text-gray-400" />
                      <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Meten</span>
                    </div>
                    <button
                      onClick={() => setShowMeasureTool(!showMeasureTool)}
                      className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                        showMeasureTool ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          showMeasureTool ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Tekengereedschap toggle - hidden in commercial */}
                {!isCommercial && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pencil size={18} className="text-gray-400" />
                      <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Tekenen</span>
                    </div>
                    <button
                      onClick={() => setShowDrawTool(!showDrawTool)}
                      className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                        showDrawTool ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          showDrawTool ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Exporteren toggle */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Printer size={18} className="text-gray-400" />
                    <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Exporteren</span>
                  </div>
                  <button
                    onClick={() => setShowPrintTool(!showPrintTool)}
                    className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                      showPrintTool ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                        showPrintTool ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Tekstgrootte schuifjes toggle */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type size={18} className="text-gray-400" />
                    <span className="text-gray-700" style={{ fontSize: '0.9em' }}>Tekstgrootte</span>
                  </div>
                  <button
                    onClick={() => setShowFontSliders(!showFontSliders)}
                    className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
                      showFontSliders ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                        showFontSliders ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Settings always at bottom */}
              <div className="mt-auto border-t border-gray-100">
                <button
                  onClick={handleSettingsClick}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-3 border-0 outline-none bg-transparent transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ fontSize: '0.95em' }}
                >
                  <Settings size={18} className="text-gray-500" />
                  <span>Instellingen</span>
                </button>
              </div>

              {/* Version Footer */}
              <div className="px-3 py-1.5 bg-gray-50 text-center text-gray-400" style={{ fontSize: '0.65em' }}>
                DetectorApp NL v{version}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
