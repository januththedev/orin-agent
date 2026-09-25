from tools.environments import local


def test_windows_cd_path_is_translated_for_git_bash(monkeypatch):
    monkeypatch.setattr(local, "_IS_WINDOWS", True)
    command = r"rm -rf old; cd 'C:\Users\Januth\project\nested'; pwd"
    translated = local._rewrite_windows_cd_paths(command)
    assert "cd '/c/Users/Januth/project/nested'" in translated
    assert "rm -rf old" in translated


def test_non_windows_command_is_unchanged(monkeypatch):
    monkeypatch.setattr(local, "_IS_WINDOWS", False)
    command = "cd '/home/user/project'"
    assert local._rewrite_windows_cd_paths(command) == command
