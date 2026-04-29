import React from 'react';
import {
  FaRocket, FaBolt, FaStar, FaFire, FaLightbulb, FaBullseye,
  FaCogs, FaKey, FaChartLine, FaFlask, FaMicrophone, FaMusic,
  FaExclamationTriangle, FaWrench, FaShieldAlt, FaHome, FaDocker,
  FaCloud, FaLock, FaCheckCircle, FaBrain, FaBook, FaFilm,
  FaCompass, FaBookmark, FaStickyNote, FaCamera, FaLaptopCode,
  FaGraduationCap, FaSearch, FaTools, FaClock, FaVolumeUp,
  FaUpload, FaDesktop, FaBalanceScale, FaSync, FaRobot,
  FaCommentDots, FaLink, FaHandshake, FaTag, FaGlobe, FaBell,
  FaDownload, FaSave, FaFolder, FaHeadphones, FaPalette, FaServer,
  FaNetworkWired, FaCube, FaDatabase, FaChartBar, FaCommentAlt,
} from 'react-icons/fa';

const ic = (Icon: React.ComponentType<{ className?: string }>): React.FC =>
  () => <Icon className="text-amber-400 inline mr-1 align-middle" aria-hidden="true" />;

export const mdxIconComponents = {
  // Launch / energy
  Rocket:     ic(FaRocket),
  Bolt:       ic(FaBolt),
  Flame:      ic(FaFire),

  // Highlights / achievements
  Star:       ic(FaStar),
  Check:      ic(FaCheckCircle),
  Target:     ic(FaBullseye),
  Trophy:     ic(FaCheckCircle),

  // Ideas / learning
  Bulb:       ic(FaLightbulb),
  Brain:      ic(FaBrain),
  Degree:     ic(FaGraduationCap),

  // Tech / tools
  Gear:       ic(FaCogs),
  Wrench:     ic(FaWrench),
  Tools:      ic(FaTools),
  Server:     ic(FaServer),
  Laptop:     ic(FaLaptopCode),
  Monitor:    ic(FaDesktop),
  Network:    ic(FaNetworkWired),
  Database:   ic(FaDatabase),
  Save:       ic(FaSave),
  Folder:     ic(FaFolder),
  Docker:     ic(FaDocker),
  Cloud:      ic(FaCloud),
  Cube:       ic(FaCube),

  // Security
  Key:        ic(FaKey),
  Lock:       ic(FaLock),
  Shield:     ic(FaShieldAlt),

  // Data / results
  Chart:      ic(FaChartLine),
  BarChart:   ic(FaChartBar),

  // Science / experiments
  Flask:      ic(FaFlask),

  // Audio / media / comms
  Mic:        ic(FaMicrophone),
  Music:      ic(FaMusic),
  Headphones: ic(FaHeadphones),
  Speaker:    ic(FaVolumeUp),
  Film:       ic(FaFilm),
  Camera:     ic(FaCamera),
  Chat:       ic(FaCommentDots),
  Talk:       ic(FaCommentAlt),
  Bell:       ic(FaBell),

  // Navigation / organisation
  Compass:    ic(FaCompass),
  Bookmark:   ic(FaBookmark),
  Tag:        ic(FaTag),
  Globe:      ic(FaGlobe),
  ChainLink:  ic(FaLink),

  // People / actions
  Handshake:  ic(FaHandshake),
  Robot:      ic(FaRobot),

  // Status / flow
  Warning:    ic(FaExclamationTriangle),
  Balance:    ic(FaBalanceScale),
  Repeat:     ic(FaSync),
  Upload:     ic(FaUpload),
  Download:   ic(FaDownload),
  Clock:      ic(FaClock),

  // Content
  Note:       ic(FaStickyNote),
  Book:       ic(FaBook),
  Palette:    ic(FaPalette),

  // Home / infra
  Home:       ic(FaHome),
  Search:     ic(FaSearch),
};

export type MdxIconName = keyof typeof mdxIconComponents;
